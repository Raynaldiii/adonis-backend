import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Vendor from './vendor.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PurchaseOrder from './purchase_order.js'

export default class PurchaseInvoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare purchaseOrderId: string

  @column()
  declare vendorId: number

  @column()
  declare date: Date

  @column()
  declare dueDate: Date

  @column()
  declare total: number

  @column()
  declare paidAmount: number

  @column()
  declare status: 'unpaid' | 'partial' | 'paid'

  @column()
  declare description: string
  
  @belongsTo(() => Vendor)
  declare vendor: BelongsTo<typeof Vendor>

  @belongsTo(() => PurchaseOrder)
  declare purchaseOrder: BelongsTo<typeof PurchaseOrder>
  
}