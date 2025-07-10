import { DateTime } from 'luxon'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'

import Pegawai from '#models/pegawai'
import PegawaiHistory from '#models/pegawai_history'
import { createPegawaiValidator, updatePegawaiValidator, pegawaiHistoryValidator } from '#validators/pegawai'
import PegawaiService from '#services/pegawai_service'
import Departemen from '#models/departemen'
import Cabang from '#models/cabang'
import User from '#models/auth/user'

export default class PegawaiController {
  async index({ request, response }: HttpContext) {
    try {
      // Ambil parameter datatable
      const draw        = Number(request.input('draw', 1))
      const start       = Number(request.input('start', 0))
      const length      = Number(request.input('length', 10))
      const searchValue = request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')

      // Hitung total data
      const total        = await Pegawai.query().count('* as total')
      const recordsTotal = total[0]?.$extras.total || 0

      // Query data dengan filter pencarian (nama/email)
      let dataQuery = Pegawai.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(nm_pegawai) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(tmp_lahir_pegawai) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(no_tlp_pegawai) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(no_ktp_pegawai) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(alamat_pegawai) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('users', (userQuery) => {
              userQuery.whereRaw('LOWER(email) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('PegawaiHistory', (historyQuery) => {
              historyQuery.whereHas('jabatan', (jabatanQuery) => {
                jabatanQuery.whereRaw('LOWER(nm_jabatan) LIKE ?', [`%${lowerSearch}%`])
              })
              historyQuery.whereHas('perusahaan', (perusahaanQuery) => {
                perusahaanQuery.whereRaw('LOWER(nm_perusahaan) LIKE ?', [`%${lowerSearch}%`])
              })
              historyQuery.whereHas('cabang', (cabangQuery) => {
                cabangQuery.whereRaw('LOWER(nm_cabang) LIKE ?', [`%${lowerSearch}%`])
              })
              historyQuery.whereHas('divisi', (divisiQuery) => {
                divisiQuery.whereRaw('LOWER(nm_divisi) LIKE ?', [`%${lowerSearch}%`])
              })
              historyQuery.whereHas('departemen', (departemenQuery) => {
                departemenQuery.whereRaw('LOWER(nm_departemen) LIKE ?', [`%${lowerSearch}%`])
              })
            })
        })
      }

      // Clone the query for counting before applying sorting
      const countQuery = dataQuery.clone()

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'users') {
            dataQuery
              .leftJoin('users', 'pegawai.user_id', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('pegawai.*')

            // Apply join for counting as well, but without select and order
            countQuery.leftJoin('users', 'pegawai.user_id', 'users.id')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      // Hitung data setelah filter
      const filtered = await countQuery.count('* as total')
      const recordsFiltered = filtered[0]?.$extras.total || 0

      // Ambil data paginasi dan preload relasi history aktif
      const data = await dataQuery
        .preload('PegawaiHistory', (query) => {
          query
            .preload('jabatan')
            .preload('perusahaan')
            .preload('cabang')
            .preload('divisi')
            .preload('departemen')
        })
        .preload('users')
        .offset(start)
        .limit(length)

      // Mapping data pegawai beserta relasi history aktif
      const mappedData = data.map((pegawai) => {
        const history = pegawai.PegawaiHistory[0] || null
        return {
          id_pegawai           : pegawai.id_pegawai,
          nm_pegawai           : pegawai.nm_pegawai,
          email                : pegawai.users?.email || '-',
          tgl_lahir_pegawai    : pegawai.tgl_lahir_pegawai,
          no_tlp_pegawai       : pegawai.no_tlp_pegawai,
          tmp_lahir_pegawai    : pegawai.tmp_lahir_pegawai,
          alamat_pegawai       : pegawai.alamat_pegawai,
          pendidikan_pegawai   : pegawai.pendidikan_pegawai,
          status_pegawai       : pegawai.status_pegawai,
          no_ktp_pegawai       : pegawai.no_ktp_pegawai,
          nik_pegawai          : pegawai.nik_pegawai,
          npwp_pegawai         : pegawai.npwp_pegawai,
          jenis_kelamin_pegawai: pegawai.jenis_kelamin_pegawai,
          tgl_masuk_pegawai    : pegawai.tgl_masuk_pegawai,
          tgl_keluar_pegawai   : pegawai.tgl_keluar_pegawai,
          istri_suami_pegawai  : pegawai.istri_suami_pegawai,
          anak_1               : pegawai.anak_1,
          anak_2               : pegawai.anak_2,
          avatar               : pegawai.avatar,
          user_id              : pegawai.user_id,
          created_at           : pegawai.createdAt,
          updated_at           : pegawai.updatedAt,
          history              : history
            ? {
                id               : history.id,
                jabatan          : history.jabatan ? { id: history.jabatan.id_jabatan, nama: history.jabatan.nm_jabatan }    : null,
                perusahaan       : history.perusahaan ? { id: history.perusahaan.id, nama: history.perusahaan.nm_perusahaan }: null,
                cabang           : history.cabang ? { id: history.cabang.id, nama: history.cabang.nm_cabang }                : null,
                divisi           : history.divisi ? { id: history.divisi.id, nama: history.divisi.nm_divisi }                : null,
                departemen       : history.departemen ? { id: history.departemen.id, nama: history.departemen.nm_departemen }: null,
                gaji_pegawai     : history.gaji_pegawai,
                tunjangan_pegawai: history.tunjangan_pegawai,
              }
            : null,
        }
      })

      return response.ok({
        draw,
        recordsTotal,
        recordsFiltered,
        data: mappedData,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data pegawai',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      // Validasi data pegawai (tanpa user_id, karena akan diisi otomatis)
      const pegawaiData = await request.validateUsing(createPegawaiValidator)
      // Pisahkan email dari pegawaiData
      const { email, ...pegawaiFields } = pegawaiData

      // Validasi data history, tanpa pegawai_id
      const historyDataRaw = await request.validateUsing(pegawaiHistoryValidator)

      // Hilangkan pegawai_id dari historyData
      const { pegawai_id, ...historyData } = historyDataRaw
      const avatar = request.file('avatar')

      // Kirim ke service
      await PegawaiService.createPegawaiWithUser(
        { ...pegawaiFields }, // hanya field pegawai
        historyData,
        avatar ?? undefined,
        email
      )

      return response.created({
        message: 'Pegawai berhasil dibuat',
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validasi Gagal',
          errors: error.messages,
        })
      }
      return response.badRequest({
        message: 'Gagal membuat pegawai',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const pegawai = await Pegawai.find(params.id)
      if (!pegawai) return response.notFound({ message: 'Pegawai tidak ditemukan' })

      await pegawai.load('PegawaiHistory', (query) => {
        query
          .preload('jabatan')
          .preload('perusahaan')
          .preload('cabang')
          .preload('divisi')
          .preload('departemen')
      })

      return response.ok(pegawai)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data pegawai',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const pegawai = await Pegawai.find(params.id)
      if (!pegawai) return response.notFound({ message: 'Pegawai tidak ditemukan' })

      const pegawaiData = await request.validateUsing(updatePegawaiValidator)
      const avatar = request.file('avatar')
      let avatarPath: string | null = pegawai.avatar || null

      if (avatar) {
        const fileName = `${cuid()}.${avatar.extname}`
        await avatar.move(app.publicPath('uploads'), {
          name: fileName,
          overwrite: true,
        })
        avatarPath = `uploads/${fileName}`
      }

      pegawai.merge({
        ...pegawaiData,
        avatar: avatarPath,
        tgl_lahir_pegawai: DateTime.fromJSDate(pegawaiData.tgl_lahir_pegawai),
        tgl_masuk_pegawai: DateTime.fromJSDate(pegawaiData.tgl_masuk_pegawai),
        tgl_keluar_pegawai: pegawaiData.tgl_keluar_pegawai
          ? DateTime.fromJSDate(pegawaiData.tgl_keluar_pegawai)
          : null,
      })

      await pegawai.save()
      // Validasi data history, tanpa pegawai_id
      const historyDataRaw = await request.validateUsing(pegawaiHistoryValidator)
      const { pegawai_id, ...historyData } = historyDataRaw

      // Update history aktif (yang selesai null) atau buat baru
      let history = await PegawaiHistory.query()
        .where('pegawai_id', pegawai.id_pegawai)
        .first()

      if (history) {
        history.merge({
          ...historyData,
        })
        await history.save()
      } else {
        await PegawaiHistory.create({
          ...historyData,
          pegawai_id: pegawai.id_pegawai,
        })
      }

      return response.ok(pegawai)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui pegawai',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const pegawai = await Pegawai.find(params.id)
      if (!pegawai) return response.notFound({ message: 'Pegawai tidak ditemukan' })

      // Hapus juga user jika ada
      if (pegawai.user_id) {
        const user = await User.find(pegawai.user_id)
        if (user) {
          await user.delete()
        }
      }

      await pegawai.delete()
      return response.ok({ message: 'Pegawai dan user terkait berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus pegawai',
        error: error.message,
      })
    }
  }

  async getDepartemenByDivisiId({ params, response }: HttpContext) {
    try {
      const departemen = await Departemen
        .query()
        .where('divisi_id', params.id)
        .preload('divisi')
      return response.ok(departemen)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil data departemen',
        error: error.message,
      })
    }
  }

  async getCabangByPerusahaanId ({ params, response }: HttpContext) {
    try {
      const cabang = await Cabang
        .query()
        .where('perusahaan_id', params.id)
        .preload('perusahaan')
      return response.ok(cabang)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil data cabang',
        error: error.message,
      })
    }
  }

  async countByStatus({ response }: HttpContext) {
    const total     = await Pegawai.query().count('* as total')
    const pkwtt     = await Pegawai.query().where('status_pegawai', 1).count('* as total')
    const pkwt      = await Pegawai.query().where('status_pegawai', 2).count('* as total')
    const outsource = await Pegawai.query().where('status_pegawai', 3).count('* as total')
    const resign    = await Pegawai.query().where('status_pegawai', 4).count('* as total')

    return response.ok({
      total    : total[0].$extras.total,
      pkwtt    : pkwtt[0].$extras.total,
      pkwt     : pkwt[0].$extras.total,
      outsource: outsource[0].$extras.total,
      resign   : resign[0].$extras.total,
    })
  }
}
