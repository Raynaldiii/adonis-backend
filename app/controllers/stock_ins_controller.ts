import type { HttpContext } from '@adonisjs/core/http'
import StockIn from '#models/stock_in'
import Stock from '#models/stock'
import db from '@adonisjs/lucid/services/db'
import StockInDetail from '#models/stock_in_detail'
import { updateStockInValidator } from '#validators/stock_in'

export default class StockInsController {

  async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')

      let dataQuery = StockIn.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(no_si) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('purchaseOrder', (pQuery) => {
              pQuery.whereRaw('LOWER(no_po) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('warehouse', (wQuery) => {
              wQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('postedByUser', (uQuery) => {
              uQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
            })
        })
      }

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'purchaseOrder') {
            dataQuery
              .leftJoin('purchase_orders', 'stock_ins.purchase_order_id', 'purchase_orders.id')
              .orderBy(`purchase_orders.${dbColumn}`, actualSortOrder)
              .select('stock_ins.*')
          } else if (relation === 'warehouse') {
            dataQuery
              .leftJoin('warehouses', 'stock_ins.warehouse_id', 'warehouses.id')
              .orderBy(`warehouses.${dbColumn}`, actualSortOrder)
              .select('stock_ins.*')
          } else if (relation === 'postedByUser') {
            dataQuery
              .leftJoin('users', 'stock_ins.posted_by', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('stock_ins.*')
          } else if (relation === 'receivedByUser') {
            dataQuery
              .leftJoin('users', 'stock_ins.received_by', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('stock_ins.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      const stockIns = await dataQuery
        .preload('warehouse')
        .preload('postedByUser')
        .preload('purchaseOrder', (poQuery) => {
          poQuery.preload('receivedByUser')
          poQuery.preload('purchaseOrderItems', (poiQuery) => {
            poiQuery.preload('product')
          })
        })
        .paginate(page, limit)

      return response.ok(stockIns.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data stock in',
        error: {
          name: 'Exception',
          status: 500
        }
      })
    }
  }

  async getStockInDetails({ params, response }: HttpContext) {
    try {
      const stockIn = await StockIn.query()
        .where('id', params.id)
        .preload('warehouse')
        .preload('postedByUser')
        .preload('purchaseOrder', (poQuery) => {
          poQuery.preload('purchaseOrderItems', (poiQuery) => {
            poiQuery.preload('product')
          })
        })
        .first()

      if (!stockIn) {
        return response.notFound({ message: 'Stock In tidak ditemukan' })
      }

      return response.ok(stockIn.toJSON())
    } catch (error) {
      console.log(error)
      return response.internalServerError({
        message: 'Gagal mengambil detail Stock In',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const stockIn = await StockIn.find(params.id)
      if (!stockIn) {
        return response.notFound({ message: 'Stock In tidak ditemukan' })
      }
      const payload = await request.validateUsing(updateStockInValidator)
      stockIn.merge({
        date       : payload.date,
        warehouseId: payload.warehouseId,
        status     : payload.status,
      })
      await stockIn.save()
      return response.ok(stockIn)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui Stock In',
        error  : error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const stockIn = await StockIn.findOrFail(params.id)
      if (!stockIn) {
        return response.notFound({ message: 'Stock In tidak ditemukan' })
      }
      await stockIn.delete()
      return response.ok({ message: 'Stock In berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus Stock In',
        error: error.message,
      })
    }
  }

  async postStockIn({ params, response, auth }: HttpContext) {
    const trx = await db.transaction()
    try {
      const stockIn = await StockIn.query({ client: trx })
        .where('id', params.id)
        .preload('stockInDetails')
        .firstOrFail()

      if (stockIn.status === 'posted') {
        await trx.rollback()
        return response.badRequest({ message: 'Stock In sudah di-post.' })
      }

      // Cek dan update/insert stok untuk setiap item di stock in details
      for (const detail of stockIn.stockInDetails) {
        // Cek apakah stok sudah ada
        const existingStock = await Stock
          .query({ client: trx })
          .where('product_id', detail.productId)
          .andWhere('warehouse_id', stockIn.warehouseId)
          .first()

        if (existingStock) {
          // Jika sudah ada, update quantity
          existingStock.quantity = Number(existingStock.quantity) + Number(detail.quantity)
          await existingStock.useTransaction(trx).save()
        } else {
          // Jika belum ada, buat record baru
          await Stock.create({
            productId  : detail.productId,
            warehouseId: stockIn.warehouseId,
            quantity   : Number(detail.quantity)
          }, { client: trx })
        }
      }

      stockIn.status   = 'posted'
      stockIn.postedAt = new Date()
      stockIn.postedBy = auth.user?.id || 0
      await stockIn.useTransaction(trx).save()
      await trx.commit()
      return response.ok(stockIn)
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({
        message: 'Gagal memposting Stock In',
        error: error.message,
      })
    }
  }

  async getTotalStockIn({ response }: HttpContext) {
    try {
      // Total semua Stock In
      const totalStockIn = await StockIn.query().count('id as total')

      // Total Stock In dengan status 'draft'
      const totalDraft = await StockIn.query().where('status', 'draft').count('id as total')

      // Total Stock In dengan status 'posted'
      const totalPosted = await StockIn.query().where('status', 'posted').count('id as total')

      return response.ok({
        total : totalStockIn[0]?.$extras.total || 0,
        draft : totalDraft[0]?.$extras.total || 0,
        posted: totalPosted[0]?.$extras.total || 0,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil total Stock In',
        error: error.message,
      })
    }
  }
}
