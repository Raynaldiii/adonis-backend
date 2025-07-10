import type { HttpContext } from '@adonisjs/core/http'
import { productValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Product from '#models/product'

export default class ProductsController {
    async index({ request, response }: HttpContext) {
    try {
      const page        = request.input('page', 1)
      const limit       = request.input('rows', 10)
      const search      = request.input('search', '')
      const searchValue = search || request.input('search.value', '')
      const sortField   = request.input('sortField')
      const sortOrder   = request.input('sortOrder')
      const warehouseId = request.input('warehouseId')

      // Query product dengan filter search jika ada
      let dataQuery = Product.query().preload('unit').preload('category')

      if (searchValue) {
        // Untuk pencarian tidak case sensitive, gunakan LOWER di query
        const lowerSearch = searchValue.toLowerCase()
        dataQuery = dataQuery.where((query) => {
          query
            .whereRaw('LOWER(name) LIKE ?', [`%${lowerSearch}%`])
            .orWhereRaw('LOWER(sku) LIKE ?', [`%${lowerSearch}%`])
        })
      }

      if (warehouseId) {
        dataQuery.preload('stocks', (stockQuery) => {
          stockQuery.where('warehouse_id', warehouseId)
        })
        .whereHas('stocks', (stockQuery) => {
          stockQuery.where('warehouse_id', warehouseId).where('quantity', '>', 0)
        })
      }

      if (sortField && sortOrder) {
        const actualSortOrder = sortOrder === '1' ? 'asc' : 'desc'
        const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase()

        if (sortField.includes('.')) {
          const [relation, column] = sortField.split('.')
          const dbColumn = toSnakeCase(column)

          if (relation === 'unit') {
            dataQuery
              .leftJoin('units', 'products.unit_id', 'units.id')
              .orderBy(`units.${dbColumn}`, actualSortOrder)
              .select('products.*')
          } else if (relation === 'category') {
            dataQuery
              .leftJoin('categories', 'products.category_id', 'categories.id')
              .orderBy(`categories.${dbColumn}`, actualSortOrder)
              .select('products.*')
          }
        } else {
          const dbColumn = toSnakeCase(sortField)
          dataQuery.orderBy(`products.${dbColumn}`, actualSortOrder)
        }
      } else {
        dataQuery.orderBy('id', 'desc')
      }

      let preloadedProductQuery = dataQuery;
      if (!sortField || !sortField.includes('unit')) {
        preloadedProductQuery = preloadedProductQuery.preload('unit', (query) => {
            query.orderBy('name', 'asc')
        });
      }
      if (!sortField || !sortField.includes('category')) {
          preloadedProductQuery = preloadedProductQuery.preload('category', (query) => {
              query.orderBy('name', 'asc')
          });
      }
      
      const product = await preloadedProductQuery.paginate(page, limit)

      return response.ok(product.toJSON())
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data produk',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)
      if (!product) {
        return response.notFound({ message: 'Product tidak ditemukan' })
      }
      return response.ok(product)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil detail product',
        error: error.message,
      })
    }
  }

    async store({ request, response }: HttpContext) {
    try {
      // Validasi data product (kecuali image)
      const payload = await request.validateUsing(productValidator)

      // Cek apakah SKU sudah ada
      const existingProduct = await Product.findBy('sku', payload.sku)
      if (existingProduct) {
        return response.badRequest({
          message: 'SKU sudah digunakan, silakan gunakan SKU lain.',
          error: 'products_sku_unique'
        })
      }

      // Proses upload image jika ada file image
      let logoPath = null
      const imageFile = request.file('image', {
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
        size: '2mb',
      })

      if (imageFile) {
        // Simpan file image ke folder public/uploads/logo_vendor
        const fileName = `${new Date().getTime()}_${imageFile.clientName}`
        await imageFile.move(app.publicPath('uploads/product'), {
          name: fileName,
          overwrite: true,
        })
        logoPath = `uploads/product/${fileName}`
      }

      // Tambahkan path image ke payload jika ada
      const product = await Product.create({
        ...payload,
        image: logoPath || '',
      })

      return response.created(product)
    } catch (error) {
      // Cek error duplikat SKU
      if (error.code === '23505' && error.detail && error.detail.includes('products_sku_unique')) {
        return response.badRequest({
          message: 'SKU sudah digunakan, silakan gunakan SKU lain.',
          error: error.detail,
        })
      }
      return response.badRequest({
        message: 'Gagal membuat product',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)
      if (!product) {
        return response.notFound({ message: 'Product tidak ditemukan' })
      }

      // Validasi data (kecuali image)
      const payload = await request.validateUsing(productValidator)

      // Cek duplikasi SKU hanya jika SKU berubah
      if (payload.sku && payload.sku !== product.sku) {
        const existingProduct = await Product.findBy('sku', payload.sku)
        if (existingProduct) {
          return response.badRequest({
            message: 'SKU sudah digunakan, silakan gunakan SKU lain.',
            error: 'products_sku_unique'
          })
        }
      }

      const dataUpdate = {
        name      : payload.name ?? product.name,
        sku       : payload.sku ?? product.sku,
        unitId    : payload.unitId ?? product.unitId,
        categoryId: payload.categoryId ?? product.categoryId,
        stockMin  : payload.stockMin ?? product.stockMin,
        priceBuy  : payload.priceBuy ?? product.priceBuy,
        priceSell : payload.priceSell ?? product.priceSell,
        isService : payload.isService ?? product.isService,
      }

      // Proses upload image jika ada file image baru
      let logoPath = product.image // default: image lama
      const imageFile = request.file('image', {
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
        size: '2mb',
      })

      if (imageFile) {
        // Simpan file image ke folder public/uploads/product
        const fileName = `${new Date().getTime()}_${imageFile.clientName}`
        await imageFile.move(app.publicPath('uploads/product'), {
          name: fileName,
          overwrite: true,
        })
        logoPath = `uploads/product/${fileName}`
      }

      // Gabungkan data update dan logoPath
      product.merge({
        ...dataUpdate,
        image: logoPath || '',
      })

      await product.save()
      return response.ok(product)
    } catch (error) {
      // Cek error duplikat SKU
      if (error.code === '23505' && error.detail && error.detail.includes('products_sku_unique')) {
        return response.badRequest({
          message: 'SKU sudah digunakan, silakan gunakan SKU lain.',
          error: error.detail,
        })
      }
      return response.badRequest({
        message: 'Gagal memperbarui product',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)
      if (!product) {
        return response.notFound({ message: 'Product tidak ditemukan' })
      }
      await product.delete()
      return response.ok({ message: 'Product berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus product',
        error: error.message,
      })
    }
  }
}