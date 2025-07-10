import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Vendor from '#models/vendor'
import Perusahaan from '#models/perusahaan'
import Cabang from '#models/cabang'
import PurchaseOrderItem from '#models/purchase_order_item'
import { randomUUID } from 'node:crypto'
import User from '#models/auth/user'

export default class PurchaseOrder extends BaseModel {
  public static table = 'purchase_orders'

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(po: PurchaseOrder) {
    po.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare vendorId: number

  @column()
  declare perusahaanId: number

  @column()
  declare cabangId: number

  @column()
  declare noPo: string

  @column()
  declare up: string

  @column()
  declare date: Date

  @column()
  declare dueDate: Date

  @column()
  declare status: 'draft' | 'approved' | 'rejected' | 'partial' | 'received'

  @column()
  declare total: number

  @column()
  declare discountPercent: number

  @column()
  declare taxPercent: number

  @column()
  declare createdBy: number

  @column()
  declare approvedBy: number | null

  @column()
  declare receivedBy: number | null

  @column()
  declare rejectedBy: number | null

  @column()
  declare approvedAt: Date | null

  @column()
  declare receivedAt: Date | null

  @column()
  declare rejectedAt: Date | null

  @column()
  declare description: string

  @column()
  declare attachment: string

  @belongsTo(() => Vendor)
  declare vendor: BelongsTo<typeof Vendor>

  @belongsTo(() => Perusahaan)
  declare perusahaan: BelongsTo<typeof Perusahaan>

  @belongsTo(() => Cabang)
  declare cabang: BelongsTo<typeof Cabang>

  @hasMany(() => PurchaseOrderItem)
  declare purchaseOrderItems: HasMany<typeof PurchaseOrderItem>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare createdByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'approvedBy',
  })
  declare approvedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'receivedBy',
  })
  declare receivedByUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'rejectedBy',
  })
  declare rejectedByUser: BelongsTo<typeof User>
}