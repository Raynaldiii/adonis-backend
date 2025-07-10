import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Product from './product.js'
import StockIn from './stock_in.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class StockInDetail extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(stockInDetail: StockInDetail) {
    stockInDetail.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare stockInId: string

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare description: string

  @belongsTo(() => StockIn)
  declare stockIn: BelongsTo<typeof StockIn>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}