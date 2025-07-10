import type { HttpContext } from '@adonisjs/core/http'
import Cuti from '#models/cuti'
import CutiBalance from '#models/cuti_balance'
import { DateTime } from 'luxon'
import { createCutiValidator, updateCutiValidator } from '#validators/cuti'

export default class CutisController {
  async index({ response }: HttpContext) {
    try {
      const cutis = await Cuti.all()
      return response.ok(cutis)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data cuti',
        error,
      })
    }
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCutiValidator)
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Autentikasi diperlukan untuk mengajukan cuti.' })
    }
    const pegawai = await user.related('pegawai').query().first()
    if (!pegawai) {
      return response.forbidden({ message: 'Akun user tidak terhubung dengan data pegawai.' })
    }
    const tanggalMulai = DateTime.fromJSDate(payload.tanggalMulai)
    const tanggalSelesai = DateTime.fromJSDate(payload.tanggalSelesai)
    if (tanggalMulai.startOf('day') > tanggalSelesai.startOf('day')) {
      return response.badRequest({
        message: 'Tanggal mulai tidak boleh lebih dari tanggal selesai.',
      })
    }
    const lamaCuti = tanggalSelesai.diff(tanggalMulai, 'days').days + 1
    const trx = await Cuti.transaction()
    try {
      const currentYear = DateTime.now().year
      const balance = await CutiBalance.query()
        .useTransaction(trx)
        .where('pegawai_id', pegawai.id_pegawai)
        .andWhere('cuti_type_id', payload.cuti_type_id)
        .andWhere('tahun', currentYear)
        .first()
      if (!balance) {
        await trx.rollback()
        return response.badRequest({
          message: 'Saldo cuti untuk jenis dan tahun ini belum tersedia. Silakan hubungi HRD.',
        })
      }
      if (balance.sisa_jatah_cuti < lamaCuti) {
        await trx.rollback()
        return response.badRequest({
          message: `Sisa jatah cuti Anda untuk jenis ${payload.cuti_type_id} tidak mencukupi. Tersisa: ${balance.sisa_jatah_cuti} hari, Anda mengajukan: ${lamaCuti} hari.`,
        })
      }
      const cuti = await Cuti.create(
        {
          cutiTypeId: payload.cuti_type_id,
          tanggalMulai: tanggalMulai,
          tanggalSelesai: tanggalSelesai,
          lamaCuti: lamaCuti,
          alasan: payload.alasan,
          attachment: payload.attachment || null,
          pegawaiId: pegawai.id_pegawai,
          status: 0,
          approvedBy: null,
          approval_date: null,
          alasanDitolak: null,
        },
        { client: trx }
      )
      await trx.commit()
      return response.created(cuti)
    } catch (error) {
      await trx.rollback()
      if (error.name === 'ValidationException') {
        return response.badRequest(error.messages)
      }
      return response.internalServerError({
        message: 'Gagal membuat pengajuan cuti. Silakan coba lagi.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const cuti = await Cuti.findOrFail(params.id)
      return response.ok(cuti)
    } catch (error) {
      return response.notFound({ message: 'Cuti tidak ditemukan', error })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateCutiValidator)
    const cutiId = params.id
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Autentikasi diperlukan.' })
    }
    const cuti = await Cuti.findOrFail(cutiId)
    const currentPegawai = await user.related('pegawai').query().first()
    const trx = await Cuti.transaction()
    try {
      const oldStatus = cuti.status
      let updateBalance = false

      if (payload.status !== undefined) {
        const newStatus = payload.status
        if (currentPegawai && cuti.pegawaiId === currentPegawai.id_pegawai && newStatus !== 0) {
          return response.forbidden({ message: 'Anda tidak diizinkan mengubah status cuti Anda.' })
        }
        if (oldStatus === 0 && newStatus === 1) {
          updateBalance = true
          cuti.status = newStatus
          cuti.approvedBy = user.id
          cuti.approval_date = DateTime.now()
          cuti.alasanDitolak = null
        } else if (oldStatus === 0 && newStatus === 2) {
          cuti.status = newStatus
          cuti.approvedBy = user.id
          cuti.approval_date = DateTime.now()
          cuti.alasanDitolak = payload.alasan_ditolak || 'Ditolak tanpa alasan spesifik.'
        } else if (oldStatus === 1 && newStatus === 3) {
          updateBalance = true
          cuti.status = newStatus
          cuti.approvedBy = user.id
          cuti.approval_date = DateTime.now()
          cuti.alasanDitolak = payload.alasan_ditolak || 'Dibatalkan oleh atasan.'
        } else if (oldStatus === 0 && newStatus === 3) {
          cuti.status = newStatus
          cuti.approvedBy = user.id
          cuti.approval_date = DateTime.now()
          cuti.alasanDitolak = payload.alasan_ditolak || 'Dibatalkan oleh pengaju.'
        } else if (oldStatus !== newStatus) {
          await trx.rollback()
          return response.badRequest({
            message: `Transisi status dari ${oldStatus} ke ${newStatus} tidak valid.`,
          })
        }
      }

      if (cuti.status === 0 && currentPegawai && cuti.pegawaiId === currentPegawai.id_pegawai) {
        const { tanggalMulai, tanggalSelesai, alasan, attachment } = payload
        if (tanggalMulai && tanggalSelesai) {
          const newTanggalMulai = DateTime.fromJSDate(tanggalMulai)
          const newTanggalSelesai = DateTime.fromJSDate(tanggalSelesai)
          if (newTanggalMulai.startOf('day') > newTanggalSelesai.startOf('day')) {
            await trx.rollback()
            return response.badRequest({
              message: 'Tanggal mulai tidak boleh lebih dari tanggal selesai.',
            })
          }
          const newLamaCuti = newTanggalSelesai.diff(newTanggalMulai, 'days').days + 1
          cuti.tanggalMulai = newTanggalMulai
          cuti.tanggalSelesai = newTanggalSelesai
          cuti.lamaCuti = newLamaCuti
        }
        if (alasan) cuti.alasan = alasan
        if (attachment !== undefined) cuti.attachment = attachment
      }

      if (updateBalance) {
        const balance = await CutiBalance.query()
          .useTransaction(trx)
          .where('pegawai_id', cuti.pegawaiId)
          .andWhere('cuti_type_id', cuti.cutiTypeId)
          .andWhere('tahun', cuti.tanggalMulai.year)
          .first()
        if (!balance) {
          await trx.rollback()
          return response.internalServerError({
            message: 'Saldo cuti pegawai tidak ditemukan untuk pembaruan. Silakan hubungi admin.',
          })
        }
        if (oldStatus === 0 && cuti.status === 1) {
          if (balance.sisa_jatah_cuti < cuti.lamaCuti) {
            await trx.rollback()
            return response.badRequest({
              message: 'Saldo cuti tidak mencukupi untuk persetujuan ini. Mohon periksa kembali.',
            })
          }
          balance.sisa_jatah_cuti -= cuti.lamaCuti
          balance.cuti_terpakai += cuti.lamaCuti
        } else if (oldStatus === 1 && cuti.status === 3) {
          balance.sisa_jatah_cuti += cuti.lamaCuti
          balance.cuti_terpakai -= cuti.lamaCuti
        }
        await balance.save()
      }

      await cuti.save()
      await trx.commit()
      return response.ok(cuti)
    } catch (error) {
      await trx.rollback()
      if (error.name === 'ValidationException') {
        return response.badRequest(error.messages)
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pengajuan cuti tidak ditemukan.' })
      }
      return response.internalServerError({
        message: 'Gagal memperbarui pengajuan cuti. Silakan coba lagi.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const cuti = await Cuti.findOrFail(params.id)
      await cuti.delete()
      return response.ok({ message: 'Cuti dihapus!' })
    } catch (error) {
      return response.internalServerError({ message: 'Gagal hapus cuti', error })
    }
  }
}
