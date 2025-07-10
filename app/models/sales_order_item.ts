import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import SalesOrder from '#models/sales_order'
import Product from '#models/product'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Warehouse from '#models/warehouse'
import { randomUUID } from 'node:crypto'

export default class SalesOrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

   @beforeCreate()
  static assignUuid(soi: SalesOrderItem) {
    soi.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare salesOrderId: string

  @column()
  declare productId: number

  @column()
  declare warehouseId: number

  @column()
  declare quantity: number

  @column()
  declare deliveredQty: number

  @column()
  declare subtotal: number

  @column()
  declare price: number

  @column()
  declare statusPartial: boolean

  @column()
  declare description: string

  @belongsTo(() => SalesOrder)
  declare salesOrder: BelongsTo<typeof SalesOrder>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Warehouse)
  declare warehouse: BelongsTo<typeof Warehouse>
}