import type { HttpContext } from '@adonisjs/core/http'
import StockOut from '#models/stock_out'
import db from '@adonisjs/lucid/services/db'
import { createStockOutValidator, updateStockOutValidator } from '#validators/stock_out'
import Stock from '#models/stock'

export default class StockOutsController {
    async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')

      let dataQuery = StockOut.query()

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(no_so) LIKE ?', [`%${lowerSearch}%`])
            .orWhereHas('salesOrder', (soQuery) => {
              soQuery.whereRaw('LOWER(no_so) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('warehouse', (wQuery) => {
              wQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('postedByUser', (uQuery) => {
              uQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
            })
            .orWhereHas('deliveredByUser', (uQuery) => {
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

          if (relation === 'salesOrder') {
            dataQuery
              .leftJoin('sales_orders', 'stock_outs.sales_order_id', 'sales_orders.id')
              .orderBy(`sales_orders.${dbColumn}`, actualSortOrder)
              .select('stock_outs.*')
          } else if (relation === 'warehouse') {
            dataQuery
              .leftJoin('warehouses', 'stock_outs.warehouse_id', 'warehouses.id')
              .orderBy(`warehouses.${dbColumn}`, actualSortOrder)
              .select('stock_outs.*')
          } else if (relation === 'postedByUser') {
            dataQuery
              .leftJoin('users', 'stock_outs.posted_by', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('stock_outs.*')
          } else if (relation === 'deliveredByUser') {
            dataQuery
              .leftJoin('users', 'stock_outs.delivered_by', 'users.id')
              .orderBy(`users.${dbColumn}`, actualSortOrder)
              .select('stock_outs.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      const stockOuts = await dataQuery
        .preload('warehouse')
        .preload('postedByUser')
        .preload('salesOrder', (soQuery) => {
          soQuery.preload('deliveredByUser')
          soQuery.preload('salesOrderItems', (soiQuery) => {
            soiQuery.preload('product')
          })
        })
        .paginate(page, limit)

      return response.ok(stockOuts.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data stock out',
        error: {
          name: 'Exception',
          status: 500
        }
      })
    }
  }

  async getStockOutDetails({ params, response }: HttpContext) {
    try {
      const stockOut = await StockOut.query()
        .where('id', params.id)
        .preload('warehouse')
        .preload('postedByUser')
        .preload('salesOrder', (soQuery) => {
          soQuery.preload('salesOrderItems', (soiQuery) => {
            soiQuery.preload('product')
          })
        })
        .first()

      if (!stockOut) {
        return response.notFound({ message: 'Stock Out tidak ditemukan' })
      }

      return response.ok(stockOut.toJSON())
    } catch (error) {
      console.log(error)
      return response.internalServerError({
        message: 'Gagal mengambil detail Stock Out',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const stockOut = await StockOut.find(params.id)
      if (!stockOut) {
        return response.notFound({ message: 'Stock Out tidak ditemukan' })
      }
      const payload = await request.validateUsing(updateStockOutValidator)
      stockOut.merge({
        noSo: payload.noSo,
        date: payload.date,
        warehouseId: payload.warehouseId,
        status: payload.status,
      })
      await stockOut.save()
      return response.ok(stockOut)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui Stock Out',
        error  : error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const stockOut = await StockOut.findOrFail(params.id)
      if (!stockOut) {
        return response.notFound({ message: 'Stock Out tidak ditemukan' })
      }
      await stockOut.delete()
      return response.ok({ message: 'Stock Out berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus Stock In',
        error: error.message,
      })
    }
  }

  async postStockOut({ params, response, auth }: HttpContext) {
    const trx = await db.transaction()
    try {
      const stockOut = await StockOut.query({ client: trx })
        .where('id', params.id)
        .preload('stockOutDetails')
        .firstOrFail()

      if (stockOut.status === 'posted') {
        await trx.rollback()
        return response.badRequest({ message: 'Stock Out sudah di-post.' })
      }

      // Cek dan update/insert stok untuk setiap item di stock out details
      for (const detail of stockOut.stockOutDetails) {
        // Cek apakah stok sudah ada
        const existingStock = await Stock
          .query({ client: trx })
          .where('product_id', detail.productId)
          .andWhere('warehouse_id', stockOut.warehouseId)
          .first()

        if (existingStock) {
          // Cek apakah stok mencukupi
          if (Number(existingStock.quantity) < Number(detail.quantity)) {
            await trx.rollback()
            return response.badRequest({
              message: 'Stock barang tidak mencukupi'
            })
          }
          // Jika sudah ada, update quantity
          existingStock.quantity = Number(existingStock.quantity) - Number(detail.quantity)
          await existingStock.useTransaction(trx).save()
        } else {
          // Jika belum ada, tidak bisa keluar stock karena stok tidak ada
          await trx.rollback()
          return response.badRequest({
            message: 'Stock barang tidak ada'
          })
        }
      }

      stockOut.status   = 'posted'
      stockOut.postedAt = new Date()
      stockOut.postedBy = auth.user?.id || 0
      await stockOut.useTransaction(trx).save()
      await trx.commit()
      return response.ok(stockOut)
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({
        message: 'Gagal memposting Stock Out',
        error: error.message,
      })
    }
  }

  async getTotalStockOut({ response }: HttpContext) {
    try {
      // Total semua Stock Out
      const totalStockOut = await StockOut.query().count('id as total')

      // Total Stock Out dengan status 'draft'
      const totalDraft = await StockOut.query().where('status', 'draft').count('id as total')

      // Total Stock Out dengan status 'posted'
      const totalPosted = await StockOut.query().where('status', 'posted').count('id as total')

      return response.ok({
        total : totalStockOut[0]?.$extras.total || 0,
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