import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PurchaseOrderItem from '#models/purchase_order_item'
import PurchaseOrder from '#models/purchase_order'
import StockIn from '#models/stock_in'
import StockInDetail from '#models/stock_in_detail'

export default class PurchaseItemsController {
  public async updateStatusPartial({ params, request, response, auth }: HttpContext) {

    // Fungsi generateNo untuk no_si
    function generateNo() {
      // Silakan sesuaikan dengan kebutuhan, contoh sederhana:
      return 'SI-' + Date.now()
    }

    try {
      const itemId = params.id
      const { statusPartial, receivedQty } = request.only(['statusPartial', 'receivedQty'])

      const purchaseOrderItem = await PurchaseOrderItem.query()
        .where('id', itemId)
        .firstOrFail()

      // Validasi: receivedQty tidak boleh melebihi quantity
      if (receivedQty !== undefined && Number(receivedQty) > purchaseOrderItem.quantity) {
        return response.badRequest({
          message: `Kuantitas diterima (${receivedQty}) tidak boleh melebihi kuantitas yang dipesan (${purchaseOrderItem.quantity}).`
        })
      }

      // Update status_partial dan received_qty item PO tersebut
      purchaseOrderItem.statusPartial = statusPartial
      if (receivedQty !== undefined) {
        purchaseOrderItem.receivedQty = receivedQty
      }
      await purchaseOrderItem.save()

      // Ambil Purchase Order terkait beserta semua itemnya
      const purchaseOrder = await PurchaseOrder.query()
        .where('id', purchaseOrderItem.purchaseOrderId)
        .preload('purchaseOrderItems')
        .firstOrFail()

      // Jika user klik checkbox dan statusPartial == true, insert ke 3 tabel sekaligus
      if (statusPartial === true || statusPartial === 'true' || statusPartial === 1) {
        // Ambil item yang sedang diubah saat ini, bukan semua item yang sudah diterima
        const item = purchaseOrderItem

        // 1. Insert atau ambil StockIn yang sudah ada (berdasarkan PO dan gudang)
        const stockIn = await StockIn.firstOrCreate({
          purchaseOrderId: purchaseOrder.id,
          warehouseId: item.warehouseId,
        }, {
          noSi: generateNo(),
          postedBy: auth.user?.id,
          date: DateTime.now().toJSDate(),
          status: 'draft',
          description: `Penerimaan otomatis dari PO #${purchaseOrder.noPo || purchaseOrder.id}`,
        })

        // 2. Insert atau Update StockInDetail untuk mencegah duplikasi
        await StockInDetail.updateOrCreate({
          stockInId: stockIn.id,
          productId: item.productId,
        }, {
          quantity: Number(item.receivedQty ?? item.quantity),
          description: item.description || '',
        })
      }

      // Logika untuk menentukan status Purchase Order
      let newPurchaseOrderStatus = purchaseOrder.status

      // Jika hanya ada 1 item di purchaseOrder, langsung set ke 'received'
      if (purchaseOrder.purchaseOrderItems.length === 1) {
        newPurchaseOrderStatus = 'received'
      } else {
        // Cek apakah ada satu saja item yang statusPartial-nya TRUE
        const hasAnyItemPartialTrue = purchaseOrder.purchaseOrderItems.some(item => item.statusPartial === true)

        // Cek apakah semua item statusPartial-nya TRUE
        const allItemsAreDone = purchaseOrder.purchaseOrderItems.every(item => item.statusPartial === true)

        if (allItemsAreDone) {
          newPurchaseOrderStatus = 'received'
        } else if (hasAnyItemPartialTrue) {
          newPurchaseOrderStatus = 'partial'
        } else {
          newPurchaseOrderStatus = 'draft'
        }
      }

      // Update status Purchase Order jika ada perubahan
      let receivedAtUpdated = false
      if (purchaseOrder.status !== newPurchaseOrderStatus) {
        purchaseOrder.status = newPurchaseOrderStatus

        // Jika status baru adalah 'received' dan semua item statusPartial == true
        const allItemsAreDone = purchaseOrder.purchaseOrderItems.every(item => item.statusPartial === true)
        if (newPurchaseOrderStatus === 'received' && allItemsAreDone) {
          // Set received_at ke tanggal sekarang
          purchaseOrder.receivedAt = new Date()
          receivedAtUpdated = true

          // Set received_by ke user yang sedang login
          if (auth && auth.user && auth.user.id) {
            purchaseOrder.receivedBy = auth.user.id
          }

          // Update received_qty pada semua item menjadi sama dengan quantity
          for (const item of purchaseOrder.purchaseOrderItems) {
            // Hanya update jika received_qty belum sama dengan quantity
            if (item.receivedQty !== item.quantity) {
                item.receivedQty = item.quantity
            }
            // Pastikan status partial juga true
            if (item.statusPartial !== true) {
                item.statusPartial = true
            }
            await item.save()
          }
        }
        await purchaseOrder.save()
      } else {
        // Jika status sudah 'received' dan semua item statusPartial == true, tetap update received_at & received_qty
        const allItemsAreDone = purchaseOrder.purchaseOrderItems.every(item => item.statusPartial === true)
        if (purchaseOrder.status === 'received' && allItemsAreDone) {
          // Set received_at ke tanggal sekarang
          purchaseOrder.receivedAt = new Date()
          receivedAtUpdated = true

          // Set received_by ke user yang sedang login
          if (auth && auth.user && auth.user.id) {
            purchaseOrder.receivedBy = auth.user.id
          }

          // Update received_qty pada semua item menjadi sama dengan quantity
          for (const item of purchaseOrder.purchaseOrderItems) {
            // Hanya update jika received_qty belum sama dengan quantity
            if (item.receivedQty !== item.quantity) {
                item.receivedQty = item.quantity
            }
            // Pastikan status partial juga true
            if (item.statusPartial !== true) {
                item.statusPartial = true
            }
            await item.save()
          }
          await purchaseOrder.save()
        }
      }

      return response.ok({
        message: 'Status partial purchase item dan Purchase Order berhasil diperbarui',
        data: {
          purchaseOrderItem: purchaseOrderItem.serialize(),
          purchaseOrder: purchaseOrder.serialize(),
        }
      })
    } catch (error) {
      console.error('Gagal memperbarui status item PO atau PO:', error)
      return response.badRequest({ message: 'Gagal memperbarui status', error: error.message })
    }
  }
}
