import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { createCategoryValidator } from '#validators/category'
import db from '@adonisjs/lucid/services/db'

export default class CategoriesController {
  async index({ request, response }: HttpContext) {
    try {
      const page   = request.input('page', 1)
      const limit  = request.input('rows', 10)
      const search = request.input('search', '')

      const query = Category.query()

      if (search) {
        query.where('name', 'like', `%${search}%`)
      }

      const categories = await Category.query().paginate(page, limit)

      return response.ok(categories.toJSON())
    } catch (error) {
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mengambil data jabatan',
        error,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        return response.notFound({ message: 'Kategori tidak ditemukan' })
      }
      return response.ok(category)
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal mengambil detail kategori',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createCategoryValidator)
      const category = await Category.create({
        name: payload.name,
        description: payload.description || '',
      })
      return response.created(category)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal membuat kategori',
        error: error.messages || error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        return response.notFound({ message: 'Kategori tidak ditemukan' })
      }
      const payload = await request.validateUsing(createCategoryValidator)
      category.merge({
        name: payload.name,
        description: payload.description || '',
      })
      await category.save()
      return response.ok(category)
    } catch (error) {
      return response.badRequest({
        message: 'Gagal memperbarui kategori',
        error: error.messages || error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const category = await Category.find(params.id)
      if (!category) {
        return response.notFound({ message: 'Kategori tidak ditemukan' })
      }
      await category.delete()
      return response.ok({ message: 'Kategori berhasil dihapus' })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghapus kategori',
        error: error.message,
      })
    }
  }

  async countProductByCategory({ response }: HttpContext) {
    try {
      // Nama kategori yang ingin dihitung
      const categoryList = [
        'Sparepart',
        'Oli',
        'Alat Berat',
        'Tooling'
      ]

      // Query untuk menghitung jumlah product per kategori
      const counts: Record<string, number> = {}
      for (const nama of categoryList) {
        const category = await Category.query().where('name', nama).first()
        if (category) {
          // Hitung product yang memiliki kategori ini (dari tabel products)
          const total = await db
            .from('products')
            .where('category_id', category.id)
            .count('* as total')
            .first()
          counts[
            nama
              .toLowerCase()
              .replace(/\s+/g, '_')
          ] = Number(total?.total || 0)
        } else {
          counts[
            nama
              .toLowerCase()
              .replace(/\s+/g, '_')
          ] = 0
        }
      }

      // Hitung total seluruh product (dari products, asumsikan satu product satu kategori aktif)
      const totalSeluruh = await db
        .from('products')
        .countDistinct('category_id as total')
        .first()

      return response.ok({
        ...counts,
        total: Number(totalSeluruh?.total || 0)
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Gagal menghitung total product per kategori',
        error: error.message,
      })
    }
  }
}
