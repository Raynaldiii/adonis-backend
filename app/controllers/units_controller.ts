import type { HttpContext } from '@adonisjs/core/http'
import Unit from '#models/unit'
import { unitValidator } from '#validators/unit'

export default class UnitsController {
    async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')

      let dataQuery = Unit.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
        })
      }

      const units = await dataQuery.paginate(page, limit)

      return response.ok(units.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data unit',
        error,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const unit = await Unit.find(params.id)
      if (!unit) {
        return response.notFound({ message: 'Unit tidak ditemukan' })
      }
      return response.ok(unit)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil detail unit',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(unitValidator)
      const unit = await Unit.create({
        name: payload.name,
        symbol: payload.symbol,
      })
      return response.created(unit)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal membuat unit',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const unit = await Unit.find(params.id)
      if (!unit) {
        return response.notFound({ message: 'Unit tidak ditemukan' })
      }
      const payload = await request.validateUsing(unitValidator)
      unit.merge({
        name: payload.name,
        symbol: payload.symbol,
      })
      await unit.save()
      return response.ok(unit)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui unit',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const unit = await Unit.find(params.id)
      if (!unit) {
        return response.notFound({ message: 'Unit tidak ditemukan' })
      }
      await unit.delete()
      return response.ok({ message: 'Unit berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus unit',
        error: error.message,
      })
    }
  }
}