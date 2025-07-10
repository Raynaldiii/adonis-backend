import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from '#models/customer'
import Product from '#models/product'

export default class ProductCustomer extends BaseModel {
  public static table = 'product_customers'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare customerId: number

  @column()
  declare priceSell: number

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}