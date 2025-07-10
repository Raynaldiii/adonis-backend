import type { HttpContext } from '@adonisjs/core/http'
import MenuGroup from '#models/menu_group'
import { createMenuGroupValidator, updateMenuGroupValidator } from '#validators/menu'
import User from '#models/auth/user'

export default class MenuGroupsController {
  async index({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user!
      await user.load('roles', (rolesQuery) => {
        rolesQuery.preload('permissions')
      })

      const userPermissions = user.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.id)
      )

      const page = request.input('page', 1)
      const limit = request.input('rows', 10)
      const search = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField = request.input('sortField')
      const sortOrder = request.input('sortOrder')
      const allMenu = request.input('all', false)

      let dataQuery = MenuGroup.query()

      if (!allMenu) {
        dataQuery.where((builder) => {
          builder
            .whereHas('permissions', (query) => {
              query.whereIn('permissions.id', userPermissions)
            })
            .orWhereHas('menuDetails', (detailsQuery) => {
              detailsQuery.whereHas('permissions', (permissionQuery) => {
                permissionQuery.whereIn('permissions.id', userPermissions)
              })
            })
        })
      }

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
        })
      }

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'menuDetails') {
            dataQuery
              .leftJoin('menu_details', 'menu_groups.id', 'menu_details.menu_group_id')
              .orderBy(`menu_details.${dbColumn}`, actualSortOrder)
              .select('menu_groups.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      const menuGroups = await dataQuery
        .preload('menuDetails', (detailsQuery) => {
          if (!allMenu) {
            detailsQuery.whereHas('permissions', (query) => {
              query.whereIn('permissions.id', userPermissions)
            })
          }
        })
        .paginate(page, limit)

      return response.ok(menuGroups.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data menu groups',
        error,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createMenuGroupValidator)

    try {
      const menuGroup = await MenuGroup.create(payload)
      return response.created(menuGroup)
    } catch (error) {
      return response.internalServerError({ message: 'Gagal membuat menu group', error })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const menuGroup = await MenuGroup.findOrFail(params.id)
      await menuGroup.load('menuDetails', (query) => {
        query.orderBy('order', 'asc')
      })
      return response.ok(menuGroup)
    } catch (error) {
      return response.notFound({ message: 'Menu group tidak ditemukan' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateMenuGroupValidator)

    try {
      const menuGroup = await MenuGroup.findOrFail(params.id)
      menuGroup.merge(payload)
      await menuGroup.save()
      return response.ok({ message: 'Menu Group berhasil diupdate' })
    } catch (error) {
      return response.internalServerError({ message: 'Gagal update menu group', error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const menuGroup = await MenuGroup.findOrFail(params.id)
      await menuGroup.delete()
      return response.ok({ message: 'Menu Group berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({ message: 'Gagal hapus menu group', error })
    }
  }
}
