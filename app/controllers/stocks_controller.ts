import type { HttpContext } from '@adonisjs/core/http'
import Stock from '#models/stock'

export default class StocksController {
  async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')
      const productId   = request.input('productId')
      const warehouseId = request.input('warehouseId')
      const all = request.input('all')

      let dataQuery = Stock.query()

      if (productId) {
        dataQuery.where('product_id', productId)
      }

      if (warehouseId) {
        dataQuery.where('warehouse_id', warehouseId)
      }

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(product_id) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('warehouse', (wQuery) => {
              wQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('warehouse', (wQuery) => {
              wQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'product') {
            dataQuery
              .leftJoin('products', 'stocks.product_id', 'products.id')
              .orderBy(`products.${dbColumn}`, actualSortOrder)
              .select('stocks.*')
          } else if (relation === 'warehouse') {
            dataQuery
              .leftJoin('warehouses', 'stocks.warehouse_id', 'warehouses.id')
              .orderBy(`warehouses.${dbColumn}`, actualSortOrder)
              .select('stocks.*')
          } else if (relation === 'user') {
            dataQuery
              .leftJoin('users', 'stocks.user_id', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('stocks.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      const queryWithPreloads = dataQuery
        .preload('warehouse')
        .preload('product', (productQuery) => {
          productQuery.preload('unit')
        })

      if (all) {
        const stocks = await queryWithPreloads
        return response.ok({ data: stocks })
      }

      const stocks = await queryWithPreloads.paginate(page, limit)

      return response.ok(stocks.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data stock',
        error: {
          name: 'Exception',
          status: 500
        }
      })
    }
  }

  // Mengambil total stock keseluruhan dan total stock per gudang
  async getTotalStock({ response }: HttpContext) {
    try {
      // Total stock keseluruhan
      const totalStock = await Stock.query().count('id as total')

      // Total stock per gudang
      const stockPerWarehouse = await Stock.query()
        .select('warehouse_id')
        .count('id as total')
        .groupBy('warehouse_id')

      return response.ok({
        total: totalStock[0]?.$extras?.total || 0,
        perWarehouse: stockPerWarehouse.map(item => ({
          warehouse_id: item.warehouseId,
          total: item.$extras.total
        }))
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data total stock',
        error: error.message,
      })
    }
  }
}