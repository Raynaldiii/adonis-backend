import type { HttpContext } from '@adonisjs/core/http'
import MenuDetail from '#models/menu_detail'
import { createMenuDetailValidator, updateMenuDetailValidator } from '#validators/menu'
import db from '@adonisjs/lucid/services/db'
import Permission from '#models/auth/permission'
import Role from '#models/auth/role'
import MenuGroup from '#models/menu_group'

export default class MenuDetailsController {
  async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')
      const menuGroupId = request.input('menu_group_id')

      let dataQuery = MenuDetail.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('menuGroup', (mgQuery) => {
              mgQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      if (menuGroupId) {
        dataQuery = dataQuery.where('menuGroupId', menuGroupId)
      }

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'menuGroup') {
            dataQuery
              .leftJoin('menu_groups', 'menu_details.menu_group_id', 'menu_groups.id')
              .orderBy(`menu_groups.${dbColumn}`, actualSortOrder)
              .select('menu_details.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      const menuDetails = await dataQuery
        .preload('menuGroup')
        .orderBy('order', 'asc')
        .paginate(page, limit)

      return response.ok(menuDetails)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data menu details',
        error,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createMenuDetailValidator)

    try {
      const menuDetail = await db.transaction(async (trx) => {
        const newMenuDetail = new MenuDetail()
        newMenuDetail.useTransaction(trx)
        newMenuDetail.fill(payload)
        await newMenuDetail.save()

        const actions = ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'show']
        const menuName = newMenuDetail.name.toLowerCase().replace(/ /g, '_')
        const permissionIds: number[] = []

        for (const action of actions) {
          const permissionName = `${action}_${menuName}`
          const permission = new Permission()
          permission.useTransaction(trx)
          permission.fill({ name: permissionName })
          await permission.save()
          permissionIds.push(permission.id)
        }

        await newMenuDetail.related('permissions').attach(permissionIds, trx)

        const menuGroup = await MenuGroup.findOrFail(newMenuDetail.menuGroupId, { client: trx })
        await menuGroup.related('permissions').attach(permissionIds, trx)

        const superadminRole = await Role.query({ client: trx }).where('name', 'superadmin').first()

        if (superadminRole) {
          await superadminRole.related('permissions').attach(permissionIds, trx)
        }

        return newMenuDetail
      })

      await menuDetail.load('menuGroup')
      return response.created(menuDetail)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal membuat menu detail',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const menuDetail = await MenuDetail.findOrFail(params.id)
      await menuDetail.load('menuGroup')
      return response.ok(menuDetail)
    } catch (error) {
      return response.notFound({ message: 'Menu detail tidak ditemukan' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateMenuDetailValidator)

    try {
      const menuDetail = await MenuDetail.findOrFail(params.id)
      menuDetail.merge(payload)
      await menuDetail.save()
      await menuDetail.load('menuGroup')
      return response.ok(menuDetail)
    } catch (error) {
      return response.internalServerError({ message: 'Gagal update menu detail', error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const menuDetail = await MenuDetail.findOrFail(params.id)
      await menuDetail.delete()
      return response.noContent()
    } catch (error) {
      return response.internalServerError({ message: 'Gagal hapus menu detail', error })
    }
  }
}
