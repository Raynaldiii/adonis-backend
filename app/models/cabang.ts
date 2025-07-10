import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Perusahaan from '#models/perusahaan'
import Pegawai from '#models/pegawai'
import PurchaseOrder from '#models/purchase_order'
import SalesOrder from '#models/sales_order'
import StockTransfer from '#models/stock_transfer'

export default class Cabang extends BaseModel {
  public static table = 'cabang'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nmCabang: string

  @column()
  declare alamatCabang: string

  @column()
  declare kodeCabang: string

  @column()
  declare perusahaanId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Perusahaan, { foreignKey: 'perusahaanId', localKey: 'id' })
  declare perusahaan: BelongsTo<typeof Perusahaan>

  @hasOne(() => Pegawai)
  declare pegawai: HasOne<typeof Pegawai>

  @hasMany(() => PurchaseOrder)
  declare purchaseOrder: HasMany<typeof PurchaseOrder>

  @hasMany(() => SalesOrder)
  declare salesOrder: HasMany<typeof SalesOrder>

  @hasMany(() => StockTransfer)
  declare stockTransfer: HasMany<typeof StockTransfer>
}
