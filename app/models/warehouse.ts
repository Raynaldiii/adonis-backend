import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Stock from '#models/stock'
import StockIn from '#models/stock_in'
import StockOut from '#models/stock_out'
import PurchaseOrderItem from '#models/purchase_order_item'
import SalesOrderItem from './sales_order_item.js'

export default class Warehouse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare code: string

  @column()
  declare address: string

  @column()
  declare phone: string

  @column()
  declare email: string

  @hasMany(() => Stock)
  declare stocks: HasMany<typeof Stock>

  @hasMany(() => StockIn)
  declare stockIns: HasMany<typeof StockIn>

  @hasMany(() => StockOut)
  declare stockOuts: HasMany<typeof StockOut>

  @hasMany(() => PurchaseOrderItem)
  declare purchaseOrderItems: HasMany<typeof PurchaseOrderItem>

  @hasMany(() => SalesOrderItem)
  declare salesOrderItems: HasMany<typeof SalesOrderItem>
}