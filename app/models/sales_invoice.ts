import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Customer from './customer.js'
import SalesOrder from './sales_order.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class SalesInvoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare salesOrderId: string

  @column()
  declare customerId: number

  @column()
  declare date: Date

  @column()
  declare dueDate: Date

  @column()
  declare discountPercent: number

  @column()
  declare taxPercent: number

  @column()
  declare total: number

  @column()
  declare paidAmount: number

  @column()
  declare status: 'unpaid' | 'partial' | 'paid'

  @column()
  declare description: string

  @belongsTo(() => SalesOrder)
  declare salesOrder: BelongsTo<typeof SalesOrder>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>
}