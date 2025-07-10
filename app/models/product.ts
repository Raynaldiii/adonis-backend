import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Unit from '#models/unit'
import Category from '#models/category'
import StockInDetail from '#models/stock_in_detail'
import StockOutDetail from '#models/stock_out_detail'
import Customer from '#models/customer'
import Stock from './stock.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare sku: string

  @column()
  declare unitId: number

  @column()
  declare categoryId: number

  @column()
  declare stockMin: number

  @column()
  declare priceBuy: number

  @column()
  declare priceSell: number

  @column()
  declare isService: boolean

  @column()
  declare image: string

  @belongsTo(() => Unit)
  declare unit: BelongsTo<typeof Unit>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => StockInDetail)
  declare stockInDetails: HasMany<typeof StockInDetail>

  @hasMany(() => StockOutDetail)
  declare stockOutDetails: HasMany<typeof StockOutDetail>

  @hasMany(() => Stock)
  declare stocks: HasMany<typeof Stock>

  @manyToMany(() => Customer, {
    pivotTable: 'product_customers',
    pivotColumns: ['price_sell'],
  })
  declare customers: ManyToMany<typeof Customer>
}