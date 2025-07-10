import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Product from './product.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Stock from './stock.js'

export default class Unit extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare symbol: string

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @hasMany(() => Stock)
  declare stocks: HasMany<typeof Stock>
}