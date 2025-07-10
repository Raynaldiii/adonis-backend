import type { HttpContext } from '@adonisjs/core/http'
import SalesOrderItem from '#models/sales_order_item'
import SalesOrder from '#models/sales_order'
import StockOut from '#models/stock_out'
import StockOutDetail from '#models/stock_out_detail'
import { DateTime } from 'luxon'

export default class SalesItemsController {
    public async updateStatusPartial({ params, request, response, auth }: HttpContext) {

    // Fungsi generateNo untuk no_so
    function generateNo() {
      // Silakan sesuaikan dengan kebutuhan, contoh sederhana:
      return 'SO-' + Date.now()
    }

    try {
      const itemId = params.id
      const { statusPartial, deliveredQty } = request.only(['statusPartial', 'deliveredQty'])

      const salesOrderItem = await SalesOrderItem.query()
        .where('id', itemId)
        .firstOrFail()

      // Validasi: deliveredQty tidak boleh melebihi quantity
      if (deliveredQty !== undefined && Number(deliveredQty) > salesOrderItem.quantity) {
        return response.badRequest({
          message: `Kuantitas diterima (${deliveredQty}) tidak boleh melebihi kuantitas yang dipesan (${salesOrderItem.quantity}).`
        })
      }

      // Update status_partial dan delivered_qty item SO tersebut
      salesOrderItem.statusPartial = statusPartial
      if (deliveredQty !== undefined) {
        salesOrderItem.deliveredQty = deliveredQty
      }
      await salesOrderItem.save()

      // Ambil Sales Order terkait beserta semua itemnya
      const salesOrder = await SalesOrder.query()
        .where('id', salesOrderItem.salesOrderId)
        .preload('salesOrderItems')
        .firstOrFail()

      // Jika user klik checkbox dan statusPartial == true, insert ke 3 tabel sekaligus
      if (statusPartial === true || statusPartial === 'true' || statusPartial === 1) {
        // Ambil item yang sedang diubah saat ini, bukan semua item yang sudah diterima
        const item = salesOrderItem

        // 1. Insert atau ambil StockOut yang sudah ada (berdasarkan PO dan gudang)
        const stockOut = await StockOut.firstOrCreate({
          salesOrderId: salesOrder.id,
          warehouseId: item.warehouseId,
        }, {
          noSo: generateNo(),
          postedBy: auth.user?.id,
          date: DateTime.now().toJSDate(),
          status: 'draft',
          description: `Penerimaan otomatis dari SO #${salesOrder.noSo || salesOrder.id}`,
        })

        // 2. Insert atau Update StockOutDetail untuk mencegah duplikasi
        await StockOutDetail.updateOrCreate({
          stockOutId: stockOut.id,
          productId: item.productId,
        }, {
          quantity: Number(item.deliveredQty ?? item.quantity),
          description: item.description || '',
        })
      }

      // Logika untuk menentukan status Sales Order
      let newSalesOrderStatus = salesOrder.status

      // Jika hanya ada 1 item di salesOrder, langsung set ke 'delivered'
      if (salesOrder.salesOrderItems.length === 1) {
        newSalesOrderStatus = 'delivered'
      } else {
        // Cek apakah ada satu saja item yang statusPartial-nya TRUE
        const hasAnyItemPartialTrue = salesOrder.salesOrderItems.some(item => item.statusPartial === true)

        // Cek apakah semua item statusPartial-nya TRUE
        const allItemsAreDone = salesOrder.salesOrderItems.every(item => item.statusPartial === true)

        if (allItemsAreDone) {
          newSalesOrderStatus = 'delivered'
        } else if (hasAnyItemPartialTrue) {
          newSalesOrderStatus = 'partial'
        } else {
          newSalesOrderStatus = 'draft'
        }
      }

      // Update status Purchase Order jika ada perubahan
      let deliveredAtUpdated = false
      if (salesOrder.status !== newSalesOrderStatus) {
        salesOrder.status = newSalesOrderStatus

        // Jika status baru adalah 'delivered' dan semua item statusPartial == true
        const allItemsAreDone = salesOrder.salesOrderItems.every(item => item.statusPartial === true)
        if (newSalesOrderStatus === 'delivered' && allItemsAreDone) {
          // Set delivered_at ke tanggal sekarang
          salesOrder.deliveredAt = new Date()
          deliveredAtUpdated = true
          salesOrder.deliveredAt = new Date()

          // Set delivered_by ke user yang sedang login
          if (auth && auth.user && auth.user.id) {
            salesOrder.deliveredBy = auth.user.id
          }

          // Update delivered_qty pada semua item menjadi sama dengan quantity
          for (const item of salesOrder.salesOrderItems) {
            // Hanya update jika delivered_qty belum sama dengan quantity
            if (item.deliveredQty !== item.quantity) {
                item.deliveredQty = item.quantity
            }
            // Pastikan status partial juga true
            if (item.statusPartial !== true) {
                item.statusPartial = true
            }
            await item.save()
          }
        }
        await salesOrder.save()
      } else {
        // Jika status sudah 'delivered' dan semua item statusPartial == true, tetap update received_at & received_qty
        const allItemsAreDone = salesOrder.salesOrderItems.every(item => item.statusPartial === true)
        if (salesOrder.status === 'delivered' && allItemsAreDone) {
          // Set delivered_at ke tanggal sekarang
          salesOrder.deliveredAt = new Date()
          deliveredAtUpdated = true

          // Set delivered_by ke user yang sedang login
          if (auth && auth.user && auth.user.id) {
            salesOrder.deliveredBy = auth.user.id
          }

          // Update delivered_qty pada semua item menjadi sama dengan quantity
          for (const item of salesOrder.salesOrderItems) {
            // Hanya update jika delivered_qty belum sama dengan quantity
            if (item.deliveredQty !== item.quantity) {
                item.deliveredQty = item.quantity
            }
            // Pastikan status partial juga true
            if (item.statusPartial !== true) {
                item.statusPartial = true
            }
            await item.save()
          }
          await salesOrder.save()
        }
      }

      return response.ok({
        message: 'Status partial sales item dan Sales Order berhasil diperbarui',
        data: {
          salesOrderItem: salesOrderItem.serialize(),
          salesOrder: salesOrder.serialize(),
        }
      })
    } catch (error) {
      console.error('Gagal memperbarui status item SO atau SO:', error)
      return response.badRequest({ message: 'Gagal memperbarui status', error: error.message })
    }
  }
}