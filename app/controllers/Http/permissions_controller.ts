import type { HttpContext } from '@adonisjs/core/http'
import Permission from '#models/auth/permission'
import MenuGroup from '#models/menu_group'
import MenuDetail from '#models/menu_detail'
import Role from '#models/auth/role'
import '#start/validator'
import {
  createPermissionValidator,
  batchPermissionValidator,
} from '#validators/auth/permission'

export default class PermissionsController {
  async index({ request, response }: HttpContext) {
    try {
      // Ambil parameter datatable
      const draw        = Number(request.input('draw', 1))
      const start       = Number(request.input('start', 0))
      const length      = Number(request.input('length', 10))
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')

      // Hitung total data
      const total = await Permission.query().count('* as total')
      const recordsTotal = total[0]?.$extras.total || 0

      // Query data dengan filter pencarian (tanpa preload dulu)
      let dataQuery = Permission.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('menuGroups', (mgQuery) => {
              mgQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('menuDetails', (mdQuery) => {
              mdQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      // Hitung data setelah filter
      const filtered = await dataQuery.clone().count('* as total')
      const recordsFiltered = filtered[0]?.$extras.total || 0

      // Ambil data paginasi (tanpa preload)
      const data = await dataQuery.offset(start).limit(length)

      // Ambil semua id permission yang didapat
      const permissionIds = data.map((p) => p.id)

      // Preload relasi menuGroups dan menuDetails secara manual
      // Ambil semua menuGroups yang terkait dengan permissionIds
      const menuGroups = await MenuGroup.query()
        .whereHas('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })
        .preload('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })

      // Ambil semua menuDetails yang terkait dengan permissionIds
      const menuDetails = await MenuDetail.query()
        .whereHas('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })
        .preload('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })

      // Ambil semua roles yang terkait dengan permissionIds
      const roles = await Role.query()
        .whereHas('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })
        .preload('permissions', (builder) => {
          builder.whereIn('permissions.id', permissionIds)
        })

      // Buat mapping menuGroups dan menuDetails berdasarkan permissionId
      const menuGroupsMap: Record<number, any[]> = {}
      menuGroups.forEach((mg) => {
        mg.permissions.forEach((perm) => {
          if (!menuGroupsMap[perm.id]) menuGroupsMap[perm.id] = []
          menuGroupsMap[perm.id].push({ id: mg.id, name: mg.name })
        })
      })

      const menuDetailsMap: Record<number, any[]> = {}
      menuDetails.forEach((md) => {
        md.permissions.forEach((perm) => {
          if (!menuDetailsMap[perm.id]) menuDetailsMap[perm.id] = []
          menuDetailsMap[perm.id].push({ id: md.id, name: md.name })
        })
      })

      // Buat mapping roles berdasarkan permissionId
      const rolesMap: Record<number, any[]> = {}
      roles.forEach((role) => {
        role.permissions.forEach((perm) => {
          if (!rolesMap[perm.id]) rolesMap[perm.id] = []
          rolesMap[perm.id].push({ id: role.id, name: role.name })
        })
      })

      // Format data untuk datatable
      const mappedData = data.map((permission) => ({
        id: permission.id,
        name: permission.name,
        menuGroups: menuGroupsMap[permission.id] || [],
        menuDetails: menuDetailsMap[permission.id] || [],
        assignedRoles: rolesMap[permission.id] || []
      }))

      return response.ok({
        draw,
        recordsTotal,
        recordsFiltered,
        data: mappedData,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data permissions',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const permission = await Permission.query()
        .where('id', params.id)
        .preload('menuGroups')
        .preload('menuDetails')
        .firstOrFail()

      return response.ok(permission)
    } catch (error) {
      return response.notFound({
        message: 'Permission tidak ditemukan',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      // Validasi menggunakan validator yang benar
      const payload = await request.validateUsing(createPermissionValidator)
      const permission = await Permission.create({ name: payload.name })

      await permission.related('menuGroups').sync(payload.menuGroupIds)
      await permission.related('menuDetails').sync(payload.menuDetailIds)

      await permission.load('menuGroups')
      await permission.load('menuDetails')

      return response.created(permission)
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validasi Gagal',
          errors: error.messages,
        })
      }
      return response.badRequest({
        message: 'Gagal membuat permission',
        error: error.message,
      })
    }
  }

  async storeBatch({ request, response }: HttpContext) {
    try {
      const { permissions } = await request.validateUsing(batchPermissionValidator)

      const createdPermissions = []

      for (const perm of permissions) {
        const permission = await Permission.create({ name: perm.name })

        await permission.related('menuGroups').attach(perm.menuGroupIds)
        await permission.related('menuDetails').attach(perm.menuDetailIds)

        createdPermissions.push(permission)
      }

      return response.created(createdPermissions)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal membuat batch permission',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const permission = await Permission.findOrFail(params.id)
      const payload = await request.validateUsing(createPermissionValidator)

      if (payload.name) {
        permission.name = payload.name
        await permission.save()
      }
      if (payload.menuGroupIds) {
        await permission.related('menuGroups').sync(payload.menuGroupIds)
      }
      if (payload.menuDetailIds) {
        await permission.related('menuDetails').sync(payload.menuDetailIds)
      }

      await permission.load('menuGroups')
      await permission.load('menuDetails')

      return response.ok(permission)
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validasi Gagal',
          errors: error.messages,
        })
      }
      return response.badRequest({
        message: 'Gagal update permission',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const permission = await Permission.findOrFail(params.id)
      await permission.delete()
      return response.ok({ message: 'Permission berhasil dihapus' })
    } catch (error) {
      return response.badRequest({
        message: 'Gagal menghapus permission',
        error: error.message,
      })
    }
  }

  public async getMenuGroupDetails({ params }: HttpContext) {
    const groupWithDetails = await MenuGroup
      .query()
      .where('id', params.id)
      .preload('menuDetails')
      .firstOrFail()

    return groupWithDetails
  }

  public async getTotalPermission({ response }: HttpContext) {
    try {
      const total = await Permission.query().count('* as total')

      // Ambil data role id 1-4 beserta nama
      const roles = await Role
        .query()
        .whereIn('id', [1, 2, 3, 4])
        .select('id', 'name')

      // Siapkan hasil akhir
      const result: any = {
        total: total[0]?.$extras.total || 0,
        roles: []
      }

      for (const role of roles) {
        const countResult = await Permission
          .query()
          .join('permission_roles', 'permissions.id', 'permission_roles.permission_id')
          .where('permission_roles.role_id', role.id)
          .countDistinct('permissions.id as total')

        result.roles.push({
          id   : role.id,
          name : role.name,
          total: Number(countResult[0]?.$extras.total || 0)
        })
      }

      return response.ok(result)
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data total permission',
        error: error.message,
      })
    }
  }

  
}
