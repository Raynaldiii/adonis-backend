import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StockOutDetail from './stock_out_detail.js'
import SalesOrder from './sales_order.js'
import User from './auth/user.js'
import Warehouse from '#models/warehouse'
import { randomUUID } from 'node:crypto'

export default class StockOut extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(stockOut: StockOut) {
    stockOut.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare noSo: string

  @column()
  declare date: Date

  @column()
  declare postedAt: Date

  @column()
  declare salesOrderId: string

  @column()
  declare warehouseId: number

  @column()
  declare postedBy: number

  @column()
  declare deliveredBy: number

  @column()
  declare status: string

  @column()
  declare description: string

  @hasMany(() => StockOutDetail)
  declare stockOutDetails: HasMany<typeof StockOutDetail>

  @belongsTo(() => SalesOrder)
  declare salesOrder: BelongsTo<typeof SalesOrder>

  @belongsTo(() => User, {
    foreignKey: 'postedBy',
  })
  declare postedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'deliveredBy',
  })
  declare deliveredByUser: BelongsTo<typeof User>

  @belongsTo(() => Warehouse)
  declare warehouse: BelongsTo<typeof Warehouse>
}