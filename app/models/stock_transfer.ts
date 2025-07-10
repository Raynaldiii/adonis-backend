import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import StockTransferDetail from '#models/stock_transfer_detail'
import Warehouse from '#models/warehouse'
import User from '#models/auth/user'
import Perusahaan from '#models/perusahaan'
import Cabang from '#models/cabang'

export default class StockTransfer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(stockTransfer: StockTransfer) {
    stockTransfer.id = randomUUID()
  }

  @column()
  declare noTransfer: string

  @column()
  declare perusahaanId: number

  @column()
  declare cabangId: number

  @column()
  declare fromWarehouseId: number

  @column()
  declare toWarehouseId: number

  @column()
  declare date: Date

  @column()
  declare transferBy: number

  @column()
  declare approvedBy: number

  @column()
  declare description: string

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare approvedAt: DateTime

  @column()
  declare rejectedBy: number

  @column.dateTime()
  declare rejectedAt: DateTime

  @hasMany(() => StockTransferDetail)
  declare stockTransferDetails: HasMany<typeof StockTransferDetail>

  @belongsTo(() => Perusahaan, {
    foreignKey: 'perusahaanId',
    localKey: 'id'
  })
  declare perusahaan: BelongsTo<typeof Perusahaan>

  @belongsTo(() => Cabang, {
    foreignKey: 'cabangId',
    localKey: 'id'
  })
  declare cabang: BelongsTo<typeof Cabang>

  @belongsTo(() => User, {
    foreignKey: 'transferBy',
  })
  declare transferByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'approvedBy',
  })
  declare approvedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'rejectedBy',
  })
  declare rejectedByUser: BelongsTo<typeof User>

  @belongsTo(() => Warehouse, {
    foreignKey: 'fromWarehouseId',
    localKey: 'id'
  })
  declare fromWarehouse: BelongsTo<typeof Warehouse>

  @belongsTo(() => Warehouse, {
    foreignKey: 'toWarehouseId',
    localKey: 'id'
  })
  declare toWarehouse: BelongsTo<typeof Warehouse>

}