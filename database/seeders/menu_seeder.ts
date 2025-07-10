import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuGroup from '#models/menu_group'
import MenuDetail from '#models/menu_detail'

export default class extends BaseSeeder {
  async run() {
    // Hapus data existing (optional)
    await MenuDetail.query().delete()
    await MenuGroup.query().delete()

    // Seed Menu Groups
    const purchasingMenuGroup = await MenuGroup.create({
      name: 'Purchasing',
      icon: 'ri-shopping-bag-4-line',
      order: 1,
      jenisMenu: 1,
    })

    const hrdMenuGroup = await MenuGroup.create({
      name: 'HRD',
      icon: 'ri-team-line',
      order: 2,
      jenisMenu: 2,
    })

    const accountingMenuGroup = await MenuGroup.create({
      name: 'Accounting',
      icon: 'ri-calculator-line',
      order: 3,
      jenisMenu: 3,
    })

    const inventoryMenuGroup = await MenuGroup.create({
      name: 'Inventory',
      icon: 'ri-store-line',
      order: 4,
      jenisMenu: 4,
    })

    const salesMenuGroup = await MenuGroup.create({
      name: 'Sales',
      icon: 'ri-shopping-cart-line',
      order: 5,
      jenisMenu: 5,
    })

    const companyMenuGroup = await MenuGroup.create({
      name: 'Company',
      icon: 'ri-building-line',
      order: 6,
      jenisMenu: 6,
    })

    const adminMenuGroup = await MenuGroup.create({
      name: 'Admin',
      icon: 'ri-settings-line',
      order: 7,
      jenisMenu: 7,
    })

    // Seed Menu Details untuk Accounting
    await MenuDetail.createMany([
      {
        name: 'Jurnal',
        route: '/accounting/jurnal',
        status: 1,
        order: 1,
        menuGroupId: accountingMenuGroup.id,
      },
      {
        name: 'Jurnal Detail',
        route: '/accounting/jurnal-detail',
        status: 1,
        order: 2,
        menuGroupId: accountingMenuGroup.id,
      },
    ])

    // Seed Menu Details untuk Sales
    await MenuDetail.createMany([
      {
        name: 'Sales Order',
        route: '/sales/sales-order',
        status: 1,
        order: 1,
        menuGroupId: salesMenuGroup.id,
      },
      {
        name: 'Sales Order Item',
        route: '/sales/sales-order-item',
        status: 1,
        order: 2,
        menuGroupId: salesMenuGroup.id,
      },
      {
        name: 'Sales Invoice',
        route: '/sales/sales-invoice',
        status: 1,
        order: 3,
        menuGroupId: salesMenuGroup.id,
      },
    ])

    // Seed Menu Details untuk Admin
    await MenuDetail.createMany([
      {
        name: 'User Management',
        route: '/users',
        status: 1,
        order: 1,
        menuGroupId: adminMenuGroup.id,
      },
      {
        name: 'Role Management',
        route: '/admin/roles',
        status: 1,
        order: 2,
        menuGroupId: adminMenuGroup.id,
      },
      {
        name: 'Permission Management',
        route: '/admin/permissions',
        status: 1,
        order: 3,
        menuGroupId: adminMenuGroup.id,
      },
      {
        name: 'Menu Group',
        route: '/admin/menu-group',
        status: 1,
        order: 4,
        menuGroupId: adminMenuGroup.id,
      },
      {
        name: 'Menu Detail',
        route: '/admin/menu-detail',
        status: 1,
        order: 5,
        menuGroupId: adminMenuGroup.id,
      },
    ])

    // Seed Menu Details untuk User
    await MenuDetail.createMany([
      {
        name: 'Purchase Order',
        route: '/purchasing/purchase-order',
        status: 1,
        order: 1,
        menuGroupId: purchasingMenuGroup.id,
      },
      {
        name: 'Purchase Order Item',
        route: '/purchasing/purchase-order-item',
        status: 1,
        order: 2,
        menuGroupId: purchasingMenuGroup.id,
      },
    ])

    // Seed Menu Details untuk Report
    await MenuDetail.createMany([
      {
        name: 'Pegawai',
        route: '/hrd/pegawai',
        status: 1,
        order: 1,
        menuGroupId: hrdMenuGroup.id,
      },
      {
        name: 'Kehadiran',
        route: '/hrd/kehadiran',
        status: 1,
        order: 2,
        menuGroupId: hrdMenuGroup.id,
      },
      {
        name: 'Cuti & Izin',
        route: '/hrd/cuti',
        status: 1,
        order: 3,
        menuGroupId: hrdMenuGroup.id,
      },
      {
        name: 'Departemen',
        route: '/hrd/departemen',
        status: 1,
        order: 4,
        menuGroupId: hrdMenuGroup.id,
      },
      {
        name: 'Jabatan',
        route: '/hrd/jabatan',
        status: 1,
        order: 5,
        menuGroupId: hrdMenuGroup.id,
      },
      {
        name: 'Divisi',
        route: '/hrd/divisi',
        status: 1,
        order: 6,
        menuGroupId: hrdMenuGroup.id,
      },
    ])

    await MenuDetail.createMany([
      {
        name: 'Stock',
        route: '/inventory/stock',
        status: 1,
        order: 1,
        menuGroupId: inventoryMenuGroup.id,
      },
      {
        name: 'Stock In',
        route: '/inventory/stock-in',
        status: 1,
        order: 2,
        menuGroupId: inventoryMenuGroup.id,
      },
      {
        name: 'Stock Out',
        route: '/inventory/stock-out',
        status: 1,
        order: 3,
        menuGroupId: inventoryMenuGroup.id,
      },
    ])

    // Seed Menu Details untuk Company
    await MenuDetail.createMany([
      {
        name: 'Perusahaan',
        route: '/company/perusahaan',
        status: 1,
        order: 1,
        menuGroupId: companyMenuGroup.id,
      },
      {
        name: 'Cabang',
        route: '/company/cabang',
        status: 1,
        order: 2,
        menuGroupId: companyMenuGroup.id,
      },
    ])
  }
}
