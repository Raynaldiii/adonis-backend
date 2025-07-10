import Cabang from "#models/cabang"
import PurchaseOrder from "#models/purchase_order"
import PurchaseOrderItem from "#models/purchase_order_item"
import { purchaseOrderValidator, updatePurchaseOrderValidator } from "#validators/purchase"
import { MultipartFile } from "@adonisjs/core/bodyparser"
import type { HttpContext } from "@adonisjs/core/http"
import app from "@adonisjs/core/services/app"
import db from "@adonisjs/lucid/services/db"
import { toRoman } from '#helper/bulan_romawi'

export default class PurchasesController {
    async index({ request, response }: HttpContext) {
        try {
            const page        = request.input('page', 1)
            const limit       = request.input('rows', 10)
            const search      = request.input('search', '')
            const searchValue = search || request.input('search.value', '')
            const sortField   = request.input('sortField')
            const sortOrder   = request.input('sortOrder')

            // Query customer dengan filter search jika ada
            let dataQuery = PurchaseOrder.query()
            .preload('vendor')
            .preload('perusahaan')
            .preload('cabang')
            .preload('purchaseOrderItems', (query) => {
                query.preload('product')
            })
            .preload('createdByUser')
            .preload('approvedByUser')
            .preload('receivedByUser')
            // .preload('rejectedByUser')

            if (searchValue) {
              // Untuk pencarian tidak case sensitive, gunakan LOWER di query
              const lowerSearch = searchValue.toLowerCase()
              dataQuery = dataQuery.where((query) => {
                query
                    .whereRaw('LOWER(no_po) LIKE ?', [`%${lowerSearch}%`])
                    .orWhereRaw('LOWER(status) LIKE ?', [`%${lowerSearch}%`])
                    .orWhereRaw('LOWER(description) LIKE ?', [`%${lowerSearch}%`])
                    .orWhereHas('vendor', (vendorQuery) => {
                        vendorQuery.whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
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
                    .orWhereHas('receivedByUser', (userQuery) => {
                        userQuery.whereRaw('LOWER(full_name) LIKE ?', [`%${lowerSearch}%`])
                    })
              })
            }

            if (sortField && sortOrder) {
              const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
              const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

              if (sortField.includes('.')) {
                  const [relation, column] = sortField.split('.')
                  const dbColumn = toSnakeCase(column)

                  if (relation === 'vendor') {
                    dataQuery
                      .leftJoin('vendors', 'purchase_orders.vendor_id', 'vendors.id')
                      .orderBy(`vendors.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'perusahaan') {
                    dataQuery
                      .leftJoin('perusahaans', 'purchase_orders.perusahaan_id', 'perusahaans.id')
                      .orderBy(`perusahaans.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'cabang') {
                    dataQuery
                      .leftJoin('cabangs', 'purchase_orders.cabang_id', 'cabangs.id')
                      .orderBy(`cabangs.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'createdByUser') {
                    dataQuery
                      .leftJoin('users', 'purchase_orders.created_by', 'users.id')
                      .orderBy(`users.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'approvedByUser') {
                    dataQuery
                      .leftJoin('users', 'purchase_orders.approved_by', 'users.id')
                      .orderBy(`users.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'rejectedByUser') {
                    dataQuery
                      .leftJoin('users', 'purchase_orders.rejected_by', 'users.id')
                      .orderBy(`users.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  } else if (relation === 'receivedByUser') {
                    dataQuery
                      .leftJoin('users', 'purchase_orders.received_by', 'users.id')
                      .orderBy(`users.${dbColumn}`, actualSortOrder)
                      .select('purchase_orders.*')
                  }
              } else {
                  const dbColumn = toSnakeCase(sortField)
                  dataQuery.orderBy(dbColumn, actualSortOrder)
              }
            }

            // Gunakan query yang sudah difilter dan di-preload
            const purchaseOrder = await dataQuery.paginate(page, limit)

            return response.ok(purchaseOrder.toJSON())
            } catch (error) {

            return response.internalServerError({
                message: 'Terjadi kesalahan saat mengambil data purchase order',
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
            const po = await PurchaseOrder.query()
            .where('id', params.id)
            .preload('vendor')
            .preload('perusahaan')
            .preload('cabang')
            .preload('purchaseOrderItems', (query) => {
                query.preload('product')
            })
            .preload('createdByUser')
            .preload('approvedByUser')
            .preload('receivedByUser')
            .preload('rejectedByUser')
            .firstOrFail()

            return response.ok({
            message: 'Purchase Order ditemukan',
            data: po,
            })
        } catch (error) {
            return response.notFound({ message: 'Purchase Order tidak ditemukan' })
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
            const lastPo = await PurchaseOrder
                .query()
                .whereRaw('EXTRACT(MONTH FROM created_at) = ?', [bulan])
                .whereRaw('EXTRACT(YEAR FROM created_at) = ?', [tahun])
                .orderBy('no_po', 'desc')
                .first()

            let lastNumber = 0
            if (lastPo && lastPo.noPo) {
                // Ambil 4 digit pertama dari no_po terakhir
                const match = lastPo.noPo.match(/^(\d{4})/)
                if (match) {
                    lastNumber = parseInt(match[1], 10)
                }
            }
            const nextNumber = (lastNumber + 1).toString().padStart(4, '0')

            // Format: 0000/APU/PO/BULAN_ROMAWI/TAHUN
            return `${nextNumber}/APU/PO/${bulanRomawi}/${tahun}`
        }

        const payload = await request.validateUsing(purchaseOrderValidator)
        const items = payload.purchaseOrderItems || []

        if (!Array.isArray(items) || items.length === 0) {
        return response.badRequest({ message: 'Items tidak boleh kosong ya' })
        }

        let attachmentPath: string | null = null

        // Upload file jika ada
        if (payload.attachment && payload.attachment instanceof MultipartFile) {
            try {
                const fileName = `${Date.now()}_${payload.attachment.clientName}`
                await payload.attachment.move(app.publicPath('uploads/purchase_orders'), {
                    name: fileName,
                    overwrite: true,
                })

                if (!payload.attachment.isValid) {
                    return response.badRequest({
                        message: 'Gagal upload file attachment',
                        error: payload.attachment.errors.map(error => error.message),
                    })
                }

                attachmentPath = `uploads/purchase_orders/${fileName}`
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

            const discount      = subtotal * (payload.discountPercent || 0) / 100
            const afterDiscount = subtotal - discount
            const tax           = afterDiscount * (payload.taxPercent || 0) / 100
            const total         = afterDiscount + tax

            const po = await PurchaseOrder.create({
                vendorId       : payload.vendorId,
                perusahaanId   : payload.perusahaanId,
                cabangId       : payload.cabangId,
                noPo           : await generateNo(),
                up             : payload.up,
                date           : payload.date,
                dueDate        : payload.dueDate,
                status         : payload.status || 'draft',
                discountPercent: payload.discountPercent || 0,
                taxPercent     : payload.taxPercent || 0,
                total,
                createdBy      : payload.createdBy,
                approvedBy     : payload.approvedBy,
                receivedBy     : payload.receivedBy,
                rejectedBy     : payload.rejectedBy,
                approvedAt     : payload.approvedAt,
                receivedAt     : payload.receivedAt,
                rejectedAt     : payload.rejectedAt,
                description    : payload.description,
                attachment     : attachmentPath || undefined,
            }, { client: trx })

            for (const item of items) {
                await PurchaseOrderItem.create({
                purchaseOrderId: po.id,
                productId      : item.productId,
                warehouseId    : item.warehouseId,
                quantity       : item.quantity,
                price          : item.price,
                description    : item.description,
                subtotal       : item.subtotal,
                statusPartial  : item.statusPartial || false,
                receivedQty    : item.receivedQty || 0,
                }, { client: trx })
            }

            await trx.commit()

            return response.created({
                message: 'Purchase Order berhasil dibuat',
                data: po,
            })
            } catch (error) {
            await trx.rollback()
            console.error('PO Error:', error)
            return response.internalServerError({
                message: 'Gagal membuat Purchase Order',
            })
        }
    }

    async update({ params, request, response }: HttpContext) {
        const payload = await request.validateUsing(updatePurchaseOrderValidator)
        const items = payload.purchaseOrderItems || []

        if (!Array.isArray(items) || items.length === 0) {
            return response.badRequest({ message: 'Items tidak boleh kosong' })
        }

        const trx = await db.transaction()

        try {
            const po = await PurchaseOrder.findOrFail(params.id, { client: trx })

            // Optional: delete old file
            let attachmentPath = po.attachment
            if (payload.attachment && payload.attachment instanceof MultipartFile) {
                const fileName = `${Date.now()}_${payload.attachment.clientName}`
                await payload.attachment.move(app.publicPath('uploads/purchase_orders'), {
                    name: fileName,
                    overwrite: true,
                })

                if (!payload.attachment.isValid) {
                    return response.badRequest({
                    message: 'Gagal upload file attachment',
                    error: payload.attachment.errors.map(e => e.message),
                    })
                }

                attachmentPath = `uploads/purchase_orders/${fileName}`
            }

            const subtotal      = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
            const discount      = subtotal * (payload.discountPercent || 0) / 100
            const afterDiscount = subtotal - discount
            const tax           = afterDiscount * (payload.taxPercent || 0) / 100
            const total         = afterDiscount + tax

            // Update PO utama
            po.merge({
            vendorId       : payload.vendorId,
            perusahaanId   : payload.perusahaanId,
            cabangId       : payload.cabangId,
            up             : payload.up,
            date           : payload.date,
            dueDate        : payload.dueDate,
            status         : payload.status || 'draft',
            discountPercent: payload.discountPercent || 0,
            taxPercent     : payload.taxPercent || 0,
            total,
            createdBy      : payload.createdBy,
            approvedBy     : payload.approvedBy,
            receivedBy     : payload.receivedBy,
            rejectedBy     : payload.rejectedBy,
            approvedAt     : payload.approvedAt,
            receivedAt     : payload.receivedAt,
            rejectedAt     : payload.rejectedAt,
            description    : payload.description,
            attachment     : attachmentPath || undefined,
            })
            await po.save()

            // Hapus item lama lalu insert ulang
            await PurchaseOrderItem.query({ client: trx })
            .where('purchase_order_id', po.id)
            .delete()

            for (const item of items) {
            await PurchaseOrderItem.create({
                    purchaseOrderId: po.id,
                    productId      : item.productId,
                    warehouseId    : item.warehouseId,
                    quantity       : item.quantity,
                    price          : item.price,
                    description    : item.description,
                    subtotal       : item.subtotal,
                    statusPartial  : item.statusPartial || false,
                    receivedQty    : item.receivedQty || 0,
                }, { client: trx })
            }

            await trx.commit()

            return response.ok({
            message: 'Purchase Order berhasil diperbarui',
            data: po,
            })
        } catch (error) {
            await trx.rollback()
            console.error('PO Update Error:', error)
            return response.internalServerError({ message: 'Gagal memperbarui Purchase Order' })
        }
    }

    async destroy({ params, response }: HttpContext) {
        try {
            const customer = await PurchaseOrder.find(params.id)
            if (!customer) {
                return response.notFound({ message: 'PurchaseOrder tidak ditemukan' })
            }
            await customer.delete()
            return response.ok({ message: 'PurchaseOrder berhasil dihapus' })
            } catch (error) {
                return response.internalServerError({
                message: 'Gagal menghapus purchase order',
                error: error.message,
                })
        }
    }

    async approvePurchaseOrder({ params, response, auth }: HttpContext) {
        try {
            const po = await PurchaseOrder.find(params.id)
            if (!po) {
                return response.notFound({ message: 'PurchaseOrder tidak ditemukan' })
            }

            po.status = 'approved'
            po.approvedAt = new Date()
            if (auth.user) {
                po.approvedBy = auth.user.id
            }
            await po.save()

            return response.ok({ message: 'Purchase Order berhasil diapprove' })
        } catch (error) {
            return response.internalServerError({ message: 'Gagal mengapprove purchase order' })
        }
    }

    async rejectPurchaseOrder({ params, response, auth }: HttpContext) {
        try {
            const po = await PurchaseOrder.find(params.id)
            if (!po) {
                return response.notFound({ message: 'PurchaseOrder tidak ditemukan' })
            }

            po.status = 'rejected'
            po.rejectedAt = new Date()
            if (auth.user) {
                po.rejectedBy = auth.user.id
            }
            await po.save()

            return response.ok({ message: 'Purchase Order berhasil direject' })
        } catch (error) {
            return response.internalServerError({ message: 'Gagal mereject purchase order' })
        }
    }

    async getPurchaseOrderDetails({ params, response }: HttpContext) {
        try {
            const po = await PurchaseOrder.query()
            .where('id', params.id)
            .preload('vendor')
            .preload('perusahaan')
            .preload('cabang')
            .preload('purchaseOrderItems', (query) => {
                query.preload('product')
            })
            .preload('createdByUser')
            .preload('approvedByUser')
            .preload('receivedByUser')
            .preload('rejectedByUser')
            .firstOrFail()

            return response.ok({
                message: 'Purchase Order ditemukan',
                data: po,
            })
        } catch (error) {
            return response.notFound({ message: 'Purchase Order tidak ditemukan' })
        }
    }

    async getCabangbyPerusahaan({ request, response }: HttpContext) {
        const perusahaanId = request.input('perusahaanId')
        const cabang = await Cabang.query()
        .where('perusahaanId', perusahaanId)
        return response.ok(cabang)
    }
}
