import type { HttpContext } from '@adonisjs/core/http'
import Perusahaan from '#models/perusahaan'
import {
  perusahaanValidator,
  updatePerusahaanValidator,
} from '#validators/perusahaan_cabang'
import app from '@adonisjs/core/services/app'

export default class PerusahaansController {
  async index({ request, response }: HttpContext) {
    try {
      const page   = request.input('page', 1)
      const limit  = request.input('rows', 10)
      const search = request.input('search', '')
      const searchValue = search || request.input('search.value', '')

      // Query perusahaan dengan filter search jika ada
      let dataQuery = Perusahaan.query().preload('cabang')


      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(nm_perusahaan) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(alamat_perusahaan) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(kode_perusahaan) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(npwp_perusahaan) LIKE ?', [`%${lowerSearch}%`])
        })
      }

      // Gunakan query yang sudah difilter dan di-preload
      const perusahaan = await dataQuery.paginate(page, limit)

      return response.ok(perusahaan.toJSON())
    } catch (error) {

      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data perusahaan',
        error: {
          name: error.name,
          status: error.status || 500,
          code: error.code,
          message: error.message,
        },
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const perusahaan = await Perusahaan.find(params.id)
      if (!perusahaan) {
        return response.notFound({ message: 'Perusahaan tidak ditemukan' })
      }
      return response.ok(perusahaan)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil detail perusahaan',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      // Validasi data perusahaan
      const payload = await request.validateUsing(perusahaanValidator)

      // Proses upload logo jika ada file logo
      let logoPath: string | null = null
      if (payload.logoPerusahaan) {
        const fileName = `${new Date().getTime()}_${payload.logoPerusahaan.clientName}`
        await payload.logoPerusahaan.move(app.publicPath('uploads/perusahaan'), {
          name: fileName,
          overwrite: true,
        })
        logoPath = `uploads/perusahaan/${fileName}`
      }

      // Tambahkan path logo ke payload jika ada
      const perusahaan = await Perusahaan.create({
        ...payload,
        logoPerusahaan: logoPath || '',
      })

      return response.created(perusahaan)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal membuat perusahaan',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const perusahaan = await Perusahaan.findOrFail(params.id)

      const payload = await request.validateUsing(updatePerusahaanValidator)

      if (payload.emailPerusahaan && payload.emailPerusahaan !== perusahaan.emailPerusahaan) {
        const existing = await Perusahaan.query()
          .where('email_perusahaan', payload.emailPerusahaan)
          .first()
        if (existing) {
          return response.badRequest({
            message: 'Gagal memperbarui perusahaan',
            error: {
              message: 'Email sudah digunakan oleh perusahaan lain.',
            },
          })
        }
      }

      // Proses upload logo jika ada file logo baru
      let logoPath = perusahaan.logoPerusahaan
      if (payload.logoPerusahaan) {
        // Simpan file logo ke folder public/uploads/perusahaan
        const fileName = `${new Date().getTime()}_${payload.logoPerusahaan.clientName}`
        await payload.logoPerusahaan.move(app.publicPath('uploads/perusahaan'), {
          name: fileName,
          overwrite: true,
        })
        logoPath = `uploads/perusahaan/${fileName}`
      }

      // Gabungkan payload dan logoPath
      perusahaan.merge({
        ...payload,
        logoPerusahaan: logoPath,
      })

      await perusahaan.save()
      return response.ok(perusahaan)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui perusahaan',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const perusahaan = await Perusahaan.find(params.id)
      if (!perusahaan) {
        return response.notFound({ message: 'Perusahaan tidak ditemukan' })
      }
      await perusahaan.delete()
      return response.ok({ message: 'Perusahaan berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus perusahaan',
        error: error.message,
      })
    }
  }
}
