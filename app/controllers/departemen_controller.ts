import type { HttpContext } from '@adonisjs/core/http'
import Departemen from '#models/departemen'
import { createDepartemenValidator } from '#validators/departemen'

export default class DepartemenController {
  async index({ request, response }: HttpContext) {
    try {
      const page     = request.input('page', 1)
      const limit    = request.input('rows', 10)
      const search   = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const divisiId = request.input('divisi_id')

      // Query departemen dengan filter search jika ada
      let dataQuery = Departemen.query().preload('divisi')

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(nm_departemen) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('divisi', (dQuery) => {
              dQuery.whereRaw('LOWER(nm_divisi) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      // Perbaikan: gunakan nama kolom yang sesuai dengan database (divisi_id)
      if (divisiId) {
        dataQuery.where('divisi_id', divisiId)
      }

      const departemens = await dataQuery
        .preload('divisi')
        .orderBy('nm_departemen', 'asc')
        .paginate(page, limit)

      return response.ok(departemens.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data departemen',
        error: error.message || error,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const departemen = await Departemen.query().where('id', params.id).preload('divisi').first()
      if (!departemen) {
        return response.notFound({ message: 'Departemen tidak ditemukan' })
      }
      return response.ok(departemen)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil detail departemen',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createDepartemenValidator)
      const departemen = await Departemen.create(payload)
      return response.created(departemen)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal membuat departemen',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const departemen = await Departemen.find(params.id)
      if (!departemen) {
        return response.notFound({ message: 'Departemen tidak ditemukan' })
      }
      const payload = await request.validateUsing(createDepartemenValidator)
      departemen.merge(payload)
      await departemen.save()
      return response.ok(departemen)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui departemen',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const departemen = await Departemen.find(params.id)
      if (!departemen) {
        return response.notFound({ message: 'Departemen tidak ditemukan' })
      }
      await departemen.delete()
      return response.ok({ message: 'Departemen berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus departemen',
        error: error.message,
      })
    }
  }
}
