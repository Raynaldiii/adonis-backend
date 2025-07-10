import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'
import Cabang from '#models/cabang'
import PurchaseOrder from '#models/purchase_order'
import SalesOrder from '#models/sales_order'
import StockTransfer from '#models/stock_transfer'

export default class Perusahaan extends BaseModel {
  public static table = 'perusahaan'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nmPerusahaan: string

  @column()
  declare alamatPerusahaan: string

  @column()
  declare tlpPerusahaan: string

  @column()
  declare emailPerusahaan: string

  @column()
  declare npwpPerusahaan: string

  @column()
  declare kodePerusahaan: string

  @column()
  declare logoPerusahaan: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Pegawai)
  declare pegawai: HasOne<typeof Pegawai>

  @hasMany(() => Cabang)
  declare cabang: HasMany<typeof Cabang>

  @hasMany(() => PurchaseOrder)
  declare purchaseOrder: HasMany<typeof PurchaseOrder>

  @hasMany(() => SalesOrder)
  declare salesOrder: HasMany<typeof SalesOrder>

  @hasMany(() => StockTransfer)
  declare stockTransfer: HasMany<typeof StockTransfer>
}
