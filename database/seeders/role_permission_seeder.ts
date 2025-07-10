import Role from '#models/auth/role'
import Permission from '#models/auth/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuGroup from '#models/menu_group'
import MenuDetail from '#models/menu_detail'
import db from '@adonisjs/lucid/services/db'

export default class RolePermissionSeeder extends BaseSeeder {
  public async run() {
    // Hapus data lama untuk menghindari duplikasi
    await db.from('permission_roles').delete()
    await db.from('menu_detail_permission').delete()
    await db.from('menu_group_permission').delete()
    await Role.query().delete()
    await Permission.query().delete()

    // Ambil semua menu group dan menu detail
    const menuGroups = await MenuGroup.all()
    const menuDetails = await MenuDetail.all()

    const permissionsToCreate: { name: string }[] = []

    // Buat permissions untuk setiap menu group (hanya view)
    for (const menuGroup of menuGroups) {
      const permissionName = `view_${menuGroup.name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`
      permissionsToCreate.push({ name: permissionName })
    }

    // Buat permissions untuk setiap menu detail (view, create, edit, delete)
    for (const menuDetail of menuDetails) {
      const baseName = menuDetail.name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')
      permissionsToCreate.push({ name: `view_${baseName}` })
      permissionsToCreate.push({ name: `create_${baseName}` })
      permissionsToCreate.push({ name: `edit_${baseName}` })
      permissionsToCreate.push({ name: `delete_${baseName}` })
      permissionsToCreate.push({ name: `show_${baseName}` })
    }

    // Tambahkan izin administratif standar
    const adminPermissions = [
      { name: 'view_role' },
      { name: 'create_role' },
      { name: 'edit_role' },
      { name: 'delete_role' },
      { name: 'show_role' },
      { name: 'view_menu_group' },
      { name: 'create_menu_group' },
      { name: 'edit_menu_group' },
      { name: 'delete_menu_group' },
      { name: 'show_menu_group' },
      { name: 'view_menu_detail' },
      { name: 'create_menu_detail' },
      { name: 'edit_menu_detail' },
      { name: 'delete_menu_detail' },
      { name: 'show_menu_detail' },
      { name: 'view_permission' },
      { name: 'create_permission' },
      { name: 'edit_permission' },
      { name: 'delete_permission' },
      { name: 'show_permission' },
    ]

    const dynamicallyGeneratedPermissions = new Set(permissionsToCreate.map((p) => p.name))
    const uniqueAdminPermissions = adminPermissions.filter(
      (p) => !dynamicallyGeneratedPermissions.has(p.name)
    )

    permissionsToCreate.push(...uniqueAdminPermissions)

    // Buat semua permission sekaligus
    const allPermissions = await Permission.createMany(permissionsToCreate)

    // Hubungkan permission ke menu group
    for (const menuGroup of menuGroups) {
      const permissionName = `view_${menuGroup.name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`
      const permission = allPermissions.find((p) => p.name === permissionName)
      if (permission) {
        await menuGroup.related('permissions').attach([permission.id])
      }
    }

    // Hubungkan permission ke menu detail
    for (const menuDetail of menuDetails) {
      const baseName = menuDetail.name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')
      const viewPerm = allPermissions.find((p) => p.name === `view_${baseName}`)
      const createPerm = allPermissions.find((p) => p.name === `create_${baseName}`)
      const editPerm = allPermissions.find((p) => p.name === `edit_${baseName}`)
      const deletePerm = allPermissions.find((p) => p.name === `delete_${baseName}`)
      const showPerm = allPermissions.find((p) => p.name === `show_${baseName}`)

      const permissionIds: number[] = []
      if (viewPerm) permissionIds.push(viewPerm.id)
      if (createPerm) permissionIds.push(createPerm.id)
      if (editPerm) permissionIds.push(editPerm.id)
      if (deletePerm) permissionIds.push(deletePerm.id)
      if (showPerm) permissionIds.push(showPerm.id)
      if (permissionIds.length > 0) {
        await menuDetail.related('permissions').attach(permissionIds)
      }
    }

    // Buat role
    const superadminRole = await Role.create({ name: 'superadmin' })
    const adminRole      = await Role.create({ name: 'admin' })
    const guestRole      = await Role.create({ name: 'guest' })

    // Hubungkan semua permissions ke role superadmin
    await superadminRole.related('permissions').attach(allPermissions.map((p) => p.id))

    // Hubungkan permissions yang dimulai dengan 'view_' ke role admin dan guest
    const viewPermissions = allPermissions.filter((p) => p.name.startsWith('view_'))
    if (viewPermissions.length > 0) {
      const viewPermissionIds = viewPermissions.map((p) => p.id)
      await adminRole.related('permissions').attach(viewPermissionIds)
      await guestRole.related('permissions').attach(viewPermissionIds)
    }
  }
}
