import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/auth/user'
import { userValidator, updateUserValidator } from '#validators/auth/user'
export default class UsersController {
  // GET /users
  async index({ request, response }: HttpContext) {
    try {
      const page     = request.input('page', 1)
      const limit    = request.input('rows', 10)
      const search   = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const isActive = request.input('isActive')
      const sortField = request.input('sortField')
      const sortOrder = request.input('sortOrder')

      let dataQuery = User.query().preload('roles')

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query: any) => {
          query
            .whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(email) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('roles', (query: any) => {
              query.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      if (isActive) {
        dataQuery.where('isActive', isActive)
      }

      const validSortFields = ['id', 'fullName', 'email', 'isActive']
      if (sortField && sortOrder && validSortFields.includes(sortField)) {
        // Mapping from model property to database column if needed, assuming snake_case
        const columnMapping: { [key: string]: string } = {
          'id': 'id',
          'fullName': 'full_name',
          'email': 'email',
          'isActive': 'is_active',
        }
        dataQuery.orderBy(columnMapping[sortField] || sortField, sortOrder)
      } else {
        dataQuery.orderBy('id', 'desc')
      }

      const users = await dataQuery.paginate(page, limit)

      return response.ok(users)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data user',
        error,
      })
    }
  }

  // POST /users
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(userValidator)

      const user = await User.create({
        fullName: data.full_name,
        email   : data.email,
        password: data.password,
        isActive: !!data.isActive,
      })

      if (data.role_ids?.length) {
        await user.related('roles').attach(data.role_ids)
      }

      await user.load('roles')
      return response.created(user)
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        return response.status(422).send({
          message: 'Gagal membuat user',
          errors: error.messages,
        })
      }
      return response.badRequest({ message: 'Gagal membuat user', error: error.message })
    }
  }

  // GET /users/:id
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound({ message: 'User tidak ditemukan' })
      }

      await user.load('roles')
      return response.ok(user)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data user',
        error: error.message,
      })
    }
  }

  // PUT /users/:id
  async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) return response.notFound({ message: 'User tidak ditemukan' })

      const data = await request.validateUsing(updateUserValidator)

      user.fullName = data.full_name
      user.email = data.email
      if (data.password) {
        user.password = data.password
      }
      user.isActive = !!data.isActive

      await user.save()

      // Sync roles jika dikirim
      if (data.role_ids) {
        await user.related('roles').sync(data.role_ids)
      }

      await user.load('roles')
      return response.ok(user)
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        return response.status(422).send({
          message: 'Gagal memperbarui user',
          errors: error.messages,
        })
      }
      return response.badRequest({ message: 'Gagal memperbarui user', error: error.message })
    }
  }

  // DELETE /users/:id
  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)
      if (!user) return response.notFound({ message: 'User tidak ditemukan' })

      await user.delete()
      return response.ok({ message: 'User berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus pegawai',
        error: error.message,
      })
    }
  }

  async countTotalUsers({ response }: HttpContext) {
    try {
      const totals          = await User.query().count('* as total')
      const aktif           = await User.query().where('isActive', true).count('* as total')
      const tidakAktif      = await User.query().where('isActive', false).count('* as total')
      const totalSuperadmin = await User.query().whereHas('roles', (query) => {
        query.where('role_id', 1)
      }).count('* as total')
      const totalAdmin = await User.query().whereHas('roles', (query) => {
        query.where('role_id', 2)
      }).count('* as total')

      return response.ok({
        total          : totals[0].$extras.total,
        aktif          : aktif[0].$extras.total,
        tidakAktif     : tidakAktif[0].$extras.total,
        totalSuperadmin: totalSuperadmin[0].$extras.total,
        totalAdmin     : totalAdmin[0].$extras.total,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil data user',
        error: error.message,
      })
    }
  }
}
