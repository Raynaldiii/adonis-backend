import { customerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import app from '@adonisjs/core/services/app'
import { MultipartFile } from "@adonisjs/core/bodyparser"
import db from '@adonisjs/lucid/services/db'
import ProductCustomer from '#models/product_customer'

export default class CustomersController {
  async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField = request.input('sortField', 'id')
      const sortOrder = request.input('sortOrder', 'asc')

      // Query customer dengan filter search jika ada
      let dataQuery = Customer.query().orderBy(sortField, sortOrder as 'asc' | 'desc')


      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(address) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(email) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(phone) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(npwp) LIKE ?', [`%${lowerSearch}%`])
        })
      }

      // Gunakan query yang sudah difilter dan di-preload
      const customer = await dataQuery.paginate(page, limit)

      return response.ok(customer.toJSON())
    } catch (error) {

      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data customer',
        error: {
          name: error.name,
          status: error.status || 500,
          code: error.code,
          message: error.message,
        },
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const customer = await Customer.query()
        .where('id', params.id)
        .preload('products', (query) => query.preload('unit'))
        .first()

      if (!customer) {
        return response.notFound({ message: 'Customer tidak ditemukan' })
      }

      // Serialize customer data and manually construct product data with pivot info
      const customerJSON = customer.serialize()
      const productList = customer.products.map((p) => {
        return {
          id: p.id,
          productId: p.id,
          name: p.name,
          sku: p.sku,
          priceSell: p.$extras.pivot_price_sell,
          unit: p.unit,
        }
      })

      customerJSON.customerProducts = productList

      // Remove the original products array to avoid redundancy
      delete customerJSON.products

      return response.ok({ data: customerJSON })
    } catch (error) {
      console.log(error)
      return response.internalServerError({
        message: 'Gagal mengambil detail customer',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(customerValidator)
    const items = payload.customerProducts || []

    if (!Array.isArray(items) || items.length === 0) {
    return response.badRequest({ message: 'items tidak boleh kosong' })
    }

    let logoPath: string | null = null

    // Upload file jika ada
    if (payload.logo && payload.logo instanceof MultipartFile) {
        try {
            const fileName = `${Date.now()}_${payload.logo.clientName}`
            await payload.logo.move(app.publicPath('uploads/customers'), {
                name: fileName,
                overwrite: true,
            })

            if (!payload.logo.isValid) {
                return response.badRequest({
                    message: 'Gagal upload file logo',
                    error: payload.logo.errors.map(error => error.message),
                })
            }

            logoPath = `uploads/customers/${fileName}`
        } catch (err) {
            return response.internalServerError({
            message: 'Gagal menyimpan file logo',
            error: err.message,
            })
        }
    }

    const trx = await db.transaction()

    try {

        const customer = await Customer.create({
            name           : payload.name,
            email          : payload.email,
            phone          : payload.phone,
            address        : payload.address,
            npwp           : payload.npwp,
            logo           : logoPath || undefined,
        })

        for (const item of items) {
            await ProductCustomer.create({
                customerId: customer.id,
                productId: item.productId,
                priceSell: item.priceSell,
            }, { client: trx })
        }

        await trx.commit()

        return response.created({
            message: 'Customer berhasil dibuat',
            data: customer,
        })
        } catch (error) {
        await trx.rollback()
        console.error('Customer Error:', error)
        return response.internalServerError({
            message: 'Gagal membuat Customer',
        })
    }
  }

  async update({ params, request, response }: HttpContext) {
      const payload = await request.validateUsing(customerValidator)
      const items = payload.customerProducts || []

      if (!Array.isArray(items) || items.length === 0) {
          return response.badRequest({ message: 'Items tidak boleh kosong' })
      }

      const trx = await db.transaction()

      try {
          const customer = await Customer.findOrFail(params.id, { client: trx })

          // Optional: delete old file
          let logoPath = customer.logo
          if (payload.logo && payload.logo instanceof MultipartFile) {
              const fileName = `${Date.now()}_${payload.logo.clientName}`
              await payload.logo.move(app.publicPath('uploads/customers'), {
                  name: fileName,
                  overwrite: true,
              })

              if (!payload.logo.isValid) {
                  return response.badRequest({
                  message: 'Gagal upload file logo',
                  error: payload.logo.errors.map(e => e.message),
                  })
              }

              logoPath = `uploads/customers/${fileName}`
          }

          // Update Customer utama
          customer.merge({
          name           : payload.name,
          email          : payload.email,
          phone          : payload.phone,
          address        : payload.address,
          npwp           : payload.npwp,
          logo           : logoPath || undefined,
          })
          await customer.save()

          // Hapus item lama lalu insert ulang
          await ProductCustomer.query({ client: trx })
          .where('customer_id', customer.id)
          .delete()

          for (const item of items) {
          await ProductCustomer.create({
                  customerId: customer.id,
                  productId: item.productId,
                  priceSell: item.priceSell,
              }, { client: trx })
          }

          await trx.commit()

          return response.ok({
          message: 'Customer berhasil diperbarui',
          data: customer,
          })
      } catch (error) {
          await trx.rollback()
          console.error('Customer Update Error:', error)
          return response.internalServerError({ message: 'Gagal memperbarui Customer' })
      }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const customer = await Customer.find(params.id)
      if (!customer) {
        return response.notFound({ message: 'Customer tidak ditemukan' })
      }
      await customer.delete()
      return response.ok({ message: 'Customer berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus customer',
        error: error.message,
      })
    }
  }
}
