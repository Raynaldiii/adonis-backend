/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Controller
import CategoriesController from '#controllers/categories_controller'
import UnitsController from '#controllers/units_controller'
import CutisController from '#controllers/cutis_controller'
import DepartemenController from '#controllers/departemen_controller'
import DivisisController from '#controllers/divisis_controller'
import JabatansController from '#controllers/jabatans_controller'
import PegawaiController from '#controllers/pegawai_controller'
import CabangsController from '#controllers/cabangs_controller'
import PerusahaansController from '#controllers/perusahaans_controller'
import AuthController from '#controllers/Http/auth_controller'
import RolesController from '#controllers/Http/roles_controller'
import MenuGroupsController from '#controllers/menu_groups_controller'
import MenuDetailsController from '#controllers/menu_details_controller'
import PermissionsController from '#controllers/Http/permissions_controller'
import UsersController from '#controllers/Http/users_controller'
import WarehousesController from '#controllers/warehouses_controller'
import ProductsController from '#controllers/products_controller'
import VendorsController from '#controllers/vendors_controller'
import CustomersController from '#controllers/customers_controller'
import PurchasesController from '#controllers/purchases_controller'
import PurchaseItemsController from '#controllers/purchase_items_controller'
import StocksController from '#controllers/stocks_controller'
import StockInsController from '#controllers/stock_ins_controller'
import StockOutsController from '#controllers/stock_outs_controller'
import SalesOrdersController from '#controllers/sales_controller'
import SalesOrderItemsController from '#controllers/sales_items_controller'
import StockTransfersController from '#controllers/stock_transfers_controller'
import AssociationsController from '#controllers/associations_controller'

router.get('/', async () => {
  return { message: 'Welcome to your API! Get your CSRF token here.' }
})

router.get('/auth/api/csrf-token', async ({ response, request }) => {
  return response.ok({ token: request.csrfToken })
})

// Auth routes
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/refresh-token', [AuthController, 'refreshToken'])
    router.get('/me', [AuthController, 'me']).use(middleware.auth({ guards: ['api'] }))
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('/auth/api')

// ------------------ Route untuk Superadmin ------------------ //

router
  .group(() => {
    router.get('/users/countTotalUsers', [UsersController, 'countTotalUsers'])
    router.resource('users', UsersController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasRole(['superadmin']))

  // ------------------ Route Superadmin & Admin ------------------ //

  router.group(() => {
    router.get('/roles', [RolesController, 'index'])
    router.post('/roles/store', [RolesController, 'store'])
    router.put('/roles/update/:id', [RolesController, 'update'])
    router.get('/roles/:id', [RolesController, 'show'])
    router.delete('/roles/delete/:id', [RolesController, 'destroy'])
    router.get('/getPermissions', [RolesController, 'getPermissions'])

    router.get('/permissions/getTotalPermission', [PermissionsController, 'getTotalPermission'])
    router.resource('permissions', PermissionsController).apiOnly()
    router.get('/permissions/getMenuGroupDetails/:id', [PermissionsController, 'getMenuGroupDetails'])
    router.post('/permissions/batch', [PermissionsController, 'storeBatch'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasRole(['superadmin', 'admin']))

  // ------------------ Route selain Superadmin & Admin ------------------ //

  // Purchase Order Router
  router.group(() => {
    router.patch('/purchase-order/approvePurchaseOrder/:id', [PurchasesController, 'approvePurchaseOrder'])
    router.patch('/purchase-order/rejectPurchaseOrder/:id', [PurchasesController, 'rejectPurchaseOrder'])
    router.post('/purchase-order/:id', [PurchasesController, 'update'])
    router.get('/purchase-order/getPurchaseOrderDetails/:id', [PurchasesController, 'getPurchaseOrderDetails'])
    router.resource('purchase-order', PurchasesController).except(['update']).apiOnly()

    // Purchase Order Item Router
    router.patch('/purchase-order-item/updateStatusPartial/:id', [PurchaseItemsController, 'updateStatusPartial'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['approve_purchase_order', 'reject_purchase_order', 'edit_purchase_order', 'delete_purchase_order', 'view_purchase_order', 'approve_purchase_order_item', 'reject_purchase_order_item', 'edit_purchase_order_item', 'delete_purchase_order_item', 'view_purchase_order_item', 'show_purchase_order']))

  // Sales Order Router
  router.group(() => {
    router.patch('/sales-order/approveSalesOrder/:id', [SalesOrdersController, 'approveSalesOrder'])
    router.patch('/sales-order/rejectSalesOrder/:id', [SalesOrdersController, 'rejectSalesOrder'])
    router.post('/sales-order/:id', [SalesOrdersController, 'update'])
    router.get('/sales-order/getSalesOrderDetails/:id', [SalesOrdersController, 'getSalesOrderDetails'])
    router.resource('sales-order', SalesOrdersController).except(['update']).apiOnly()

    // Sales Order Item Router
    router.patch('/sales-order-item/updateStatusPartial/:id', [SalesOrderItemsController, 'updateStatusPartial'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['approve_sales_order', 'reject_sales_order', 'edit_sales_order', 'delete_sales_order', 'view_sales_order', 'approve_sales_order_item', 'reject_sales_order_item', 'edit_sales_order_item', 'delete_sales_order_item', 'view_sales_order_item', 'show_sales_order']))

  // Pegawai Router
  router.group(() => {
    router.get('/pegawai/countByStatus', [PegawaiController, 'countByStatus'])
    router.resource('pegawai', PegawaiController).apiOnly()
    router.get('/pegawai/getDepartemenByDivisiId/:id', [PegawaiController, 'getDepartemenByDivisiId'])
    router.get('/pegawai/getCabangByPerusahaanId/:id', [PegawaiController, 'getCabangByPerusahaanId'])
    router.post('/pegawai/update/:id', [PegawaiController, 'update'])
    router.delete('/pegawai/delete/:id', [PegawaiController, 'destroy'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['edit_pegawai', 'delete_pegawai', 'view_pegawai', 'create_pegawai', 'approve_pegawai', 'reject_pegawai', 'show_pegawai']))

  // Menu Router
  router.group(() => {
    router.resource('menu-groups', MenuGroupsController).apiOnly()
    router.resource('menu-details', MenuDetailsController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_menu_group', 'view_menu_detail', 'edit_menu_group', 'edit_menu_detail', 'delete_menu_group', 'delete_menu_detail', 'create_menu_group', 'create_menu_detail', 'approve_menu_group', 'approve_menu_detail', 'reject_menu_group', 'reject_menu_detail', 'show_menu_group', 'show_menu_detail']))

  // Jabatan Router
  router.group(() => {
    router.get('/jabatan/countPegawaiByJabatan', [JabatansController, 'countPegawaiByJabatan'])
    router.resource('jabatan', JabatansController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_jabatan', 'edit_jabatan', 'delete_jabatan', 'create_jabatan', 'approve_jabatan', 'reject_jabatan', 'show_jabatan']))

  // Perusahaan Router
  router.group(() => {
    router.post('/perusahaan/:id', [PerusahaansController, 'update'])
    router.resource('perusahaan', PerusahaansController).except(['update']).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['edit_perusahaan', 'delete_perusahaan', 'view_perusahaan', 'create_perusahaan', 'approve_perusahaan', 'reject_perusahaan', 'show_perusahaan']))

  // Unit Router
  router.group(() => {
    router.resource('unit', UnitsController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_unit', 'edit_unit', 'delete_unit', 'create_unit', 'approve_unit', 'reject_unit', 'show_unit']))

  // Product Router
  router.group(() => {
    router.post('/product/:id', [ProductsController, 'update'])
    router.resource('product', ProductsController).except(['update']).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_product', 'edit_product', 'delete_product', 'create_product', 'approve_product', 'reject_product', 'show_product']))

  // Customer Router
  router.group(() => {
    router.post('/customer/:id', [CustomersController, 'update'])
    router.resource('customer', CustomersController).except(['update']).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_customer', 'edit_customer', 'delete_customer', 'create_customer', 'approve_customer', 'reject_customer', 'show_customer']))

  // Vendor Router
  router.group(() => {
    router.post('/vendor/:id', [VendorsController, 'update'])
    router.resource('vendor', VendorsController).except(['update']).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_vendor', 'edit_vendor', 'delete_vendor', 'create_vendor', 'approve_vendor', 'reject_vendor', 'show_vendor']))

  // Kategori Router
  router.group(() => {
    router.get('/categories/countProductByCategory', [CategoriesController, 'countProductByCategory'])
    router.resource('categories', CategoriesController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_kategori', 'edit_kategori', 'delete_kategori', 'create_kategori', 'approve_kategori', 'reject_kategori', 'show_kategori']))

  // Cabang Router
  router.group(() => {
    router.resource('cabang', CabangsController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_cabang', 'edit_cabang', 'delete_cabang', 'create_cabang', 'approve_cabang', 'reject_cabang', 'show_cabang']))

  // Divisi Router
  router.group(() => {
    router.resource('divisi', DivisisController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_divisi', 'edit_divisi', 'delete_divisi', 'create_divisi', 'approve_divisi', 'reject_divisi', 'show_divisi']))

  // Departemen Router
  router.group(() => {
    router.resource('departemen', DepartemenController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_departemen', 'edit_departemen', 'delete_departemen', 'create_departemen', 'approve_departemen', 'reject_departemen', 'show_departemen']))

  // Warehouse Router
  router.group(() => {
    router.get('/warehouse/getTotalWarehouse', [WarehousesController, 'getTotalWarehouse'])
    router.resource('warehouse', WarehousesController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_gudang', 'edit_gudang', 'delete_gudang', 'create_gudang', 'approve_gudang', 'reject_gudang', 'show_gudang']))

  // Stock Router
  router.group(() => {
    router.get('/stock/getTotalStock', [StocksController, 'getTotalStock'])
    router.resource('stock', StocksController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_stock', 'edit_stock', 'delete_stock', 'create_stock', 'approve_stock', 'reject_stock', 'show_stock']))

  // Stock In Router
  router.group(() => {
    router.post('/stock-in/postStockIn/:id', [StockInsController, 'postStockIn'])
    router.get('/stock-in/getTotalStockIn', [StockInsController, 'getTotalStockIn'])
    router.get('/stock-in/getStockInDetails/:id', [StockInsController, 'getStockInDetails'])
    router.resource('stock-in', StockInsController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_stock_in', 'edit_stock_in', 'delete_stock_in', 'create_stock_in', 'approve_stock_in', 'reject_stock_in', 'show_stock_in']))

  // Stock Out Router
  router.group(() => {
    router.post('/stock-out/postStockOut/:id', [StockOutsController, 'postStockOut'])
    router.get('/stock-out/getTotalStockOut', [StockOutsController, 'getTotalStockOut'])
    router.get('/stock-out/getStockOutDetails/:id', [StockOutsController, 'getStockOutDetails'])
    router.resource('stock-out', StockOutsController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_stock_out', 'edit_stock_out', 'delete_stock_out', 'create_stock_out', 'approve_stock_out', 'reject_stock_out', 'show_stock_out']))

  // Stock Transfer Router
  router.group(() => {
    router.get('/stock-transfer/getTotalStockTransfer', [StockTransfersController, 'getTotalStockTransfer'])
    router.get('/stock-transfer/getStockTransferDetails/:id', [StockTransfersController, 'getStockTransferDetails'])
    router.get('/stock-transfer/cetakStockTransfer/:id', [StockTransfersController, 'getStockTransferDetails'])
    router.patch('/stock-transfer/approveStockTransfer/:id', [StockTransfersController, 'approveStockTransfer'])
    router.patch('/stock-transfer/rejectStockTransfer/:id', [StockTransfersController, 'rejectStockTransfer'])
    router.resource('stock-transfer', StockTransfersController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_stock_transfer', 'edit_stock_transfer', 'delete_stock_transfer', 'create_stock_transfer', 'approve_stock_transfer', 'reject_stock_transfer', 'show_stock_transfer']))

  // Cuti Router
  router.group(() => {
    router.resource('cuti', CutisController).apiOnly()
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_cuti', 'edit_cuti', 'delete_cuti', 'create_cuti', 'approve_cuti', 'reject_cuti', 'show_cuti']))

  // Associations Router
  router.group(() => {
    router.get('/associations', [AssociationsController, 'index'])
  })
  .prefix('/api')
  .use(middleware.auth())
  .use(middleware.hasPermission(['view_associations']))