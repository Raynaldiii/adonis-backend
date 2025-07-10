import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PurchaseInvoice from '#models/purchase_invoice'
import PurchaseOrder from '#models/purchase_order'

export default class Vendor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare address: string

  @column()
  declare npwp: string

  @column()
  declare logo: string

  @hasMany(() => PurchaseInvoice)
  declare purchaseInvoices: HasMany<typeof PurchaseInvoice>

  @hasMany(() => PurchaseOrder)
  declare purchaseOrders: HasMany<typeof PurchaseOrder>
}