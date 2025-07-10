import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StockInDetail from './stock_in_detail.js'
import Stock from './stock.js'
import User from './auth/user.js'
import PurchaseOrder from './purchase_order.js'
import Warehouse from './warehouse.js'
import { randomUUID } from 'node:crypto'

export default class StockIn extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(stockIn: StockIn) {
    stockIn.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare noSi: string

  @column()
  declare date: Date

  @column()
  declare postedAt: Date

  @column()
  declare purchaseOrderId: string

  @column()
  declare warehouseId: number

  @column()
  declare quantity: number

  @column()
  declare description: string

  @column()
  declare status: string

  @column()
  declare postedBy: number

  @column()
  declare receivedBy: number

  @hasMany(() => StockInDetail)
  declare stockInDetails: HasMany<typeof StockInDetail>

  @belongsTo(() => PurchaseOrder, {
    foreignKey: 'purchaseOrderId',
    localKey: 'id'
  })
  declare purchaseOrder: BelongsTo<typeof PurchaseOrder>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Stock, {
    foreignKey: 'stockId',
    localKey: 'id'
  })
  declare stock: BelongsTo<typeof Stock>

  @belongsTo(() => Warehouse)
  declare warehouse: BelongsTo<typeof Warehouse>

  @belongsTo(() => User, {
    foreignKey: 'postedBy',
  })
  declare postedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'receivedBy',
  })
  declare receivedByUser: BelongsTo<typeof User>
}
