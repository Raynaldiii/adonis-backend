import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Product from './product.js'
import StockOut from './stock_out.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class StockOutDetail extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(stockOutDetail: StockOutDetail) {
    stockOutDetail.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare stockOutId: string

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare price: number

  @column()
  declare subTotal: number

  @column()
  declare description: string

  @belongsTo(() => StockOut)
  declare stockOut: BelongsTo<typeof StockOut>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}