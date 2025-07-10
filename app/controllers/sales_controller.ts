import type { HttpContext } from '@adonisjs/core/http'
import SalesOrder from '#models/sales_order'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import Cabang from '#models/cabang'
import SalesOrderItem from '#models/sales_order_item'
import { salesOrderValidator, updateSalesOrderValidator } from '#validators/sale'
import { toRoman } from '#helper/bulan_romawi'
import Mail from '@adonisjs/mail/services/main'
import SalesOrderCreated from '#mails/sales_order_created'
import Customer from '#models/customer'
import Perusahaan from '#models/perusahaan'

export default class SalesController {
  async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')
      const customerId  = request.input('customerId')
      const source      = request.input('source')
      const status      = request.input('status')

      // Query customer dengan filter search jika ada
      let dataQuery = SalesOrder.query()
      .preload('customer')
      .preload('perusahaan')
      .preload('cabang')
      .preload('salesOrderItems', (query) => {
          query.preload('product')
      })
      .preload('createdByUser')
      .preload('approvedByUser')
      .preload('deliveredByUser')
      // .preload('rejectedByUser')

      if (customerId) {
        dataQuery.where('customer_id', customerId)
      }
      if (source) {
        dataQuery.where('source', source)
      }
      if (status) {
        dataQuery.where('status', status)
      }

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
              .whereRaw('LOWER(no_so) LIKE ?', [`%${lowerSearch}%`])
              .orWhereRaw('LOWER(status) LIKE ?', [`%${lowerSearch}%`])
              .orWhereRaw('LOWER(description) LIKE ?', [`%${lowerSearch}%`])
              .orWhereHas('customer', (customerQuery) => {
                  customerQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
              })
              .orWhereHas('createdByUser', (userQuery) => {
                  userQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
              })
              .orWhereHas('approvedByUser', (userQuery) => {
                  userQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
              })
              .orWhereHas('rejectedByUser', (userQuery) => {
                  userQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
              })
              .orWhereHas('deliveredByUser', (userQuery) => {
                  userQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
              })
        })
      }

      let customOrder = false
      if (sortField && sortOrder) {
        customOrder = true
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
            const [relation, column] = sortField.split('.')
            const dbColumn = toSnakeCase(column)

            if (relation === 'customer') {
              dataQuery
                .leftJoin('customer', 'sales_orders.customer_id', 'customer.id')
                .orderBy(`customer.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'perusahaan') {
              dataQuery
                .leftJoin('perusahaans', 'sales_orders.perusahaan_id', 'perusahaans.id')
                .orderBy(`perusahaans.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'cabang') {
              dataQuery
                .leftJoin('cabangs', 'sales_orders.cabang_id', 'cabangs.id')
                .orderBy(`cabangs.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'createdByUser') {
              dataQuery
                .leftJoin('users', 'sales_orders.created_by', 'users.id')
                .orderBy(`users.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'approvedByUser') {
              dataQuery
                .leftJoin('users', 'sales_orders.approved_by', 'users.id')
                .orderBy(`users.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'rejectedByUser') {
              dataQuery
                .leftJoin('users', 'sales_orders.rejected_by', 'users.id')
                .orderBy(`users.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            } else if (relation === 'deliveredByUser') {
              dataQuery
                .leftJoin('users', 'sales_orders.delivered_by', 'users.id')
                .orderBy(`users.${dbColumn}`, actualSortOrder)
                .select('sales_orders.*')
            }
        } else {
            const dbColumn = toSnakeCase(sortField)
            dataQuery.orderBy(dbColumn, actualSortOrder)
        }
      }

      // Tambahkan order by no_so desc sebagai default jika tidak ada sortField & sortOrder
      if (!customOrder) {
        dataQuery.orderBy('created_at', 'desc')
      }

      // Gunakan query yang sudah difilter dan di-preload
      const salesOrders = await dataQuery.paginate(page, limit)

      return response.ok(salesOrders.toJSON())
      } catch (error) {

      return response.internalServerError({
          message: 'Terjadi kesalahan saat mengambil data sales order',
          error: {
              name   : error.name,
              status : error.status || 500,
              code   : error.code,
              message: error.message,
          },
      })
    }
  }

  async show({ params, response }: HttpContext) {
      try {
          const so = await SalesOrder.query()
          .where('id', params.id)
          .preload('customer')
          .preload('perusahaan')
          .preload('cabang')
          .preload('salesOrderItems', (query) => {
              query.preload('product')
          })
          .preload('createdByUser')
          .preload('approvedByUser')
          .preload('deliveredByUser')
          .preload('rejectedByUser')
          .firstOrFail()

          return response.ok({
          message: 'Sales Order ditemukan',
          data: so,
          })
      } catch (error) {
          return response.notFound({ message: 'Sales Order tidak ditemukan' })
      }
  }

  async store({ request, response }: HttpContext) {
    // Fungsi generateNo untuk no_po dengan format 0000/APU/PO/Bulan dalam angka romawi/tahun
    async function generateNo() {
      // Ambil nomor urut terakhir dari PO bulan ini
      const now   = new Date()
      const bulan = now.getMonth() + 1
      const tahun = now.getFullYear()

      // Konversi bulan ke angka romawi
      const bulanRomawi = toRoman(bulan)

      // Cari nomor urut terakhir untuk bulan dan tahun ini
      const lastPo = await SalesOrder
          .query()
          .whereRaw('EXTRACT(MONTH FROM created_at) = ?', [bulan])
          .whereRaw('EXTRACT(YEAR FROM created_at) = ?', [tahun])
          .orderBy('no_so', 'desc')
          .first()

      let lastNumber = 0
      if (lastPo && lastPo.noSo) {
          // Ambil 4 digit pertama dari no_po terakhir
          const match = lastPo.noSo.match(/^(\d{4})/)
          if (match) {
              lastNumber = parseInt(match[1], 10)
          }
      }
      const nextNumber = (lastNumber + 1).toString().padStart(4, '0')

      // Format: 0000/APU/PO/BULAN_ROMAWI/TAHUN
      return `${nextNumber}/APU/SO/${bulanRomawi}/${tahun}`
    }
    const payload = await request.validateUsing(salesOrderValidator)
    const items = payload.salesOrderItems || []

    if (!Array.isArray(items) || items.length === 0) {
    return response.badRequest({ message: 'Items tidak boleh kosong ya' })
    }

    let attachmentPath: string | null = null

    // Upload file jika ada
    if (payload.attachment && payload.attachment instanceof MultipartFile) {
      try {
        const fileName = `${Date.now()}_${payload.attachment.clientName}`
        await payload.attachment.move(app.publicPath('uploads/sales_orders'), {
          name     : fileName,
          overwrite: true,
        })

        if (!payload.attachment.isValid) {
          return response.badRequest({
            message: 'Gagal upload file attachment',
            error: payload.attachment.errors.map((error: any) => error.message),
          })
        }

        attachmentPath = `uploads/sales_orders/${fileName}`
      } catch (err) {
        return response.internalServerError({
        message: 'Gagal menyimpan file attachment',
        error: err.message,
        })
      }
    }

    const trx = await db.transaction()

    try {
      const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
      )

      const discount = subtotal * (payload.discountPercent / 100)
      const afterDiscount = subtotal - discount
      const tax = afterDiscount * (payload.taxPercent / 100)
      const total = afterDiscount + tax

      const so = await SalesOrder.create({
          customerId     : payload.customerId,
          perusahaanId   : payload.perusahaanId,
          cabangId       : payload.cabangId,
          noPo           : payload.noPo,
          noSo           : payload.noSo || await generateNo(),
          up             : payload.up,
          date           : payload.date,
          dueDate        : payload.dueDate,
          status         : payload.status || 'draft',
          paymentMethod  : payload.paymentMethod,
          source         : payload.source,
          discountPercent: payload.discountPercent,
          taxPercent     : payload.taxPercent,
          total,
          createdBy  : payload.createdBy,
          approvedBy : payload.approvedBy,
          deliveredBy: payload.deliveredBy,
          rejectedBy : payload.rejectedBy,
          approvedAt : payload.approvedAt,
          deliveredAt: payload.deliveredAt,
          rejectedAt : payload.rejectedAt,
          description: payload.description,
          attachment : attachmentPath || undefined,
      }, { client: trx })

      for (const item of items) {
          await SalesOrderItem.create({
          salesOrderId : so.id,
          productId    : item.productId,
          warehouseId  : item.warehouseId,
          quantity     : item.quantity,
          price        : item.price,
          description  : item.description,
          subtotal     : item.subtotal,
          statusPartial: item.statusPartial || false,
          deliveredQty : item.deliveredQty || 0,
          }, { client: trx })
      }

      await trx.commit()

      // Ambil data terkait untuk email
      const customer = await Customer.findOrFail(so.customerId)
      const perusahaan = await Perusahaan.findOrFail(so.perusahaanId)
      const cabang = await Cabang.findOrFail(so.cabangId)

      // Kirim email notifikasi
      try {
        await Mail.send(new SalesOrderCreated(so, customer, perusahaan, cabang))
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Jangan gagalkan seluruh proses jika email gagal terkirim
        // Mungkin tambahkan logging atau notifikasi ke admin di sini
      }

      return response.created({
          message: 'Sales Order berhasil dibuat',
          data: so,
      })
      } catch (error) {
      await trx.rollback()
      console.error('SO Error:', error)
      return response.internalServerError({
          message: 'Gagal membuat Sales Order',
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
      const payload = await request.validateUsing(updateSalesOrderValidator)
      const items = payload.salesOrderItems || []

      if (!Array.isArray(items) || items.length === 0) {
          return response.badRequest({ message: 'Items tidak boleh kosong' })
      }

      const trx = await db.transaction()

      try {
          const so = await SalesOrder.findOrFail(params.id, { client: trx })

          // Optional: delete old file
          let attachmentPath = so.attachment
          if (payload.attachment && payload.attachment instanceof MultipartFile) {
              const fileName = `${Date.now()}_${payload.attachment.clientName}`
              await payload.attachment.move(app.publicPath('uploads/sales_orders'), {
                  name: fileName,
                  overwrite: true,
              })

              if (!payload.attachment.isValid) {
                  return response.badRequest({
                  message: 'Gagal upload file attachment',
                  error: payload.attachment.errors.map((e: any) => e.message),
                  })
              }

              attachmentPath = `uploads/sales_orders/${fileName}`
          }

          const subtotal      = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
          const discount      = subtotal * (payload.discountPercent || 0) / 100
          const afterDiscount = subtotal - discount
          const tax           = afterDiscount * (payload.taxPercent || 0) / 100
          const total         = afterDiscount + tax

          // Update SO utama
          so.merge({
          customerId     : payload.customerId,
          perusahaanId   : payload.perusahaanId,
          cabangId       : payload.cabangId,
          noPo           : payload.noPo,
          noSo           : payload.noSo,
          up             : payload.up,
          date           : payload.date,
          dueDate        : payload.dueDate,
          status         : payload.status || 'draft',
          paymentMethod  : payload.paymentMethod,
          source         : payload.source,
          discountPercent: payload.discountPercent || 0,
          taxPercent     : payload.taxPercent || 0,
          total,
          createdBy  : payload.createdBy,
          approvedBy : payload.approvedBy,
          deliveredBy: payload.deliveredBy,
          rejectedBy : payload.rejectedBy,
          approvedAt : payload.approvedAt,
          deliveredAt: payload.deliveredAt,
          rejectedAt : payload.rejectedAt,
          description: payload.description,
          attachment : attachmentPath || undefined,
          })
          await so.save()

          // Hapus item lama lalu insert ulang item baru
          await SalesOrderItem.query({ client: trx })
          .where('sales_order_id', so.id)
          .delete()

          for (const item of items) {
          await SalesOrderItem.create({
                  salesOrderId: so.id,
                  productId      : item.productId,
                  warehouseId    : item.warehouseId,
                  quantity       : item.quantity,
                  price          : item.price,
                  description    : item.description,
                  subtotal       : item.subtotal,
                  statusPartial  : item.statusPartial || false,
                  deliveredQty    : item.deliveredQty || 0,
              }, { client: trx })
          }

          await trx.commit()

          return response.ok({
          message: 'Sales Order berhasil diperbarui',
          data: so,
          })
      } catch (error) {
          await trx.rollback()
          console.error('PO Update Error:', error)
          return response.internalServerError({ message: 'Gagal memperbarui Sales Order' })
      }
  }

  async destroy({ params, response }: HttpContext) {
      try {
          const customer = await SalesOrder.find(params.id)
          if (!customer) {
              return response.notFound({ message: 'SalesOrder tidak ditemukan' })
          }
          await customer.delete()
          return response.ok({ message: 'SalesOrder berhasil dihapus' })
          } catch (error) {
              return response.internalServerError({
              message: 'Gagal menghapus purchase order',
              error: error.message,
              })
      }
  }

  async approveSalesOrder({ params, response, auth }: HttpContext) {
      try {
          const so = await SalesOrder.find(params.id)
          if (!so) {
              return response.notFound({ message: 'SalesOrder tidak ditemukan' })
          }

          so.status = 'approved'
          so.approvedAt = new Date()
          if (auth.user) {
              so.approvedBy = auth.user.id
          }
          await so.save()

          return response.ok({ message: 'Sales Order berhasil diapprove' })
      } catch (error) {
          return response.internalServerError({ message: 'Gagal mengapprove purchase order' })
      }
  }

  async rejectSalesOrder({ params, response, auth }: HttpContext) {
      try {
          const so = await SalesOrder.find(params.id)
          if (!so) {
              return response.notFound({ message: 'SalesOrder tidak ditemukan' })
          }

          so.status = 'rejected'
          so.rejectedAt = new Date()
          if (auth.user) {
              so.rejectedBy = auth.user.id
          }
          await so.save()

          return response.ok({ message: 'Sales Order berhasil direject' })
      } catch (error) {
          return response.internalServerError({ message: 'Gagal mereject purchase order' })
      }
  }

  async getSalesOrderDetails({ params, response }: HttpContext) {
      try {
          const so = await SalesOrder.query()
          .where('id', params.id)
          .preload('customer')
          .preload('perusahaan')
          .preload('cabang')
          .preload('salesOrderItems', (query) => {
              query.preload('product')
          })
          .preload('createdByUser')
          .preload('approvedByUser')
          .preload('deliveredByUser')
          .preload('rejectedByUser')
          .firstOrFail()

          return response.ok({
              message: 'Sales Order ditemukan',
              data: so,
          })
      } catch (error) {
          return response.notFound({ message: 'Sales Order tidak ditemukan' })
      }
  }

  async getCabangbyPerusahaan({ request, response }: HttpContext) {
      const perusahaanId = request.input('perusahaanId')
      const cabang = await Cabang.query()
      .where('perusahaanId', perusahaanId)
      return response.ok(cabang)
  }
}
