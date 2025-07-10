import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import PurchaseOrder from '#models/purchase_order'
import Product from '#models/product'
import Warehouse from '#models/warehouse'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class PurchaseOrderItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(poi: PurchaseOrderItem) {
    poi.id = randomUUID()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare purchaseOrderId: string

  @column()
  declare productId: number

  @column()
  declare warehouseId: number

  @column()
  declare quantity: number

  @column()
  declare price: number

  @column()
  declare subtotal: number

  @column()
  declare statusPartial: boolean

  @column()
  declare receivedQty: number

  @column()
  declare description: string

  @column()
  @belongsTo(() => PurchaseOrder)
  declare purchaseOrder: BelongsTo<typeof PurchaseOrder>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Warehouse)
  declare warehouse: BelongsTo<typeof Warehouse>
}