import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import FPGrowth, { Itemset } from 'node-fpgrowth'

// Fungsi bantuan untuk mendapatkan semua himpunan bagian (subsets) dari sebuah array
function getSubsets<T>(array: T[]): T[][] {
  const subsets = [[]] as T[][]
  for (const element of array) {
    const last = subsets.length - 1
    for (let i = 0; i <= last; i++) {
      subsets.push([...subsets[i], element])
    }
  }
  // Menghapus himpunan kosong dan himpunan itu sendiri
  return subsets.slice(1, subsets.length -1)
}

export default class AssociationsController {
  public async index({ response }: HttpContext) {
    // Step 1: Ambil transaksi, per sales_order dan daftar product_id
    const raw = await db
      .from('sales_order_items')
      .select('sales_order_id', 'product_id')
      .orderBy('sales_order_id', 'asc')

    // Step 2: Group berdasarkan sales_order_id
    const grouped: Record<number, number[]> = {}

    raw.forEach((item) => {
      if (!grouped[item.sales_order_id]) {
        grouped[item.sales_order_id] = []
      }
      grouped[item.sales_order_id].push(item.product_id)
    })

    const transactions = Object.values(grouped) // array of array of product_id

    // Step 3: Jalankan FP-Growth
    const fpgrowth = new FPGrowth.FPGrowth<number>(0.3)

    const frequentItemsets: Itemset<number>[] = await fpgrowth.exec(transactions)

    // Buat peta support untuk pencarian cepat
    const supportMap = new Map<string, number>()
    frequentItemsets.forEach(itemset => {
      // Urutkan item untuk memastikan kunci konsisten
      const key = [...itemset.items].sort().join(',')
      supportMap.set(key, itemset.support)
    })

    const minConfidence = 0.6
    const associationRules: any[] = []

    // Hasilkan aturan dari frequent itemsets
    frequentItemsets.forEach(itemset => {
      if (itemset.items.length > 1) {
        const allSubsets = getSubsets(itemset.items)
        allSubsets.forEach(antecedent => {
          const antecedentKey = [...antecedent].sort().join(',')
          const antecedentSupport = supportMap.get(antecedentKey)

          if (antecedentSupport) {
            const confidence = itemset.support / antecedentSupport
            if (confidence >= minConfidence) {
              const consequent = itemset.items.filter(item => !antecedent.includes(item))
              if (consequent.length > 0) {
                 associationRules.push({
                  antecedent,
                  consequent,
                  confidence,
                  support: itemset.support,
                })
              }
            }
          }
        })
      }
    })

    // Step 4: Translate product_id ke nama produk (opsional)
    const allInvolvedProductIds = [
      ...new Set(associationRules.flatMap(rule => [...rule.antecedent, ...rule.consequent]))
    ]

    const products = await db
      .from('products')
      .whereIn('id', allInvolvedProductIds)
      .select('id', 'name')

    const productMap: Record<number, string> = {}
    products.forEach(p => {
      productMap[p.id] = p.name
    })

    const result = associationRules.map(rule => ({
      antecedent: rule.antecedent.map((id: number) => productMap[id] || `#${id}`),
      consequent: rule.consequent.map((id: number) => productMap[id] || `#${id}`),
      support: rule.support,
      confidence: rule.confidence,
    }))

    return response.ok(result)
  }
}