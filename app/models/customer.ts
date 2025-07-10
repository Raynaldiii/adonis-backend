import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import SalesInvoice from '#models/sales_invoice'
import Product from '#models/product'

export default class Customer extends BaseModel {
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

  @hasMany(() => SalesInvoice)
  declare salesInvoices: HasMany<typeof SalesInvoice>

  @manyToMany(() => Product, {
    pivotTable: 'product_customers',
    pivotColumns: ['price_sell'],
  })
  declare products: ManyToMany<typeof Product>

}