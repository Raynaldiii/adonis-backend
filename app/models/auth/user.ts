import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { column, BaseModel, manyToMany, hasOne, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import AccessToken from '#models/auth/auth_access_token'
import type { ManyToMany, HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'
import Role from '#models/auth/role'
import Pegawai from '#models/pegawai'
import PurchaseOrder from '#models/purchase_order'
import SalesOrder from '#models/sales_order'
import StockIn from '#models/stock_in'
import StockOut from '#models/stock_out'
import StockTransfer from '#models/stock_transfer'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Role, {
    pivotTable: 'role_user',
  })
  declare roles: ManyToMany<typeof Role>

  @hasOne(() => Pegawai)
  declare pegawai: HasOne<typeof Pegawai>

  @hasMany(() => PurchaseOrder, {
    foreignKey: 'createdBy',
  })
  declare createdPurchaseOrders: HasMany<typeof PurchaseOrder>

  @hasMany(() => PurchaseOrder, {
    foreignKey: 'approvedBy',
  })
  declare approvedPurchaseOrders: HasMany<typeof PurchaseOrder>

  @hasMany(() => PurchaseOrder, {
    foreignKey: 'receivedBy',
  })
  declare receivedPurchaseOrders: HasMany<typeof PurchaseOrder>

  @hasMany(() => PurchaseOrder, {
    foreignKey: 'rejectedBy',
  })
  declare rejectedPurchaseOrders: HasMany<typeof PurchaseOrder>

  @hasMany(() => SalesOrder, {
    foreignKey: 'createdBy',
  })
  declare createdSalesOrders: HasMany<typeof SalesOrder>

  @hasMany(() => SalesOrder, {
    foreignKey: 'approvedBy',
  })
  declare approvedSalesOrders: HasMany<typeof SalesOrder>

  @hasMany(() => SalesOrder, {
    foreignKey: 'rejectedBy',
  })
  declare rejectedSalesOrders: HasMany<typeof SalesOrder>

  @hasMany(() => SalesOrder, {
    foreignKey: 'deliveredBy',
  })
  declare deliveredSalesOrders: HasMany<typeof SalesOrder>

  @hasMany(() => StockIn, {
    foreignKey: 'postedBy',
  })
  declare postedStockIns: HasMany<typeof StockIn>

  @hasMany(() => StockIn, {
    foreignKey: 'receivedBy',
  })
  declare receivedStockIns: HasMany<typeof StockIn>

  @hasMany(() => StockOut, {
    foreignKey: 'deliveredBy',
  })
  declare deliveredStockOuts: HasMany<typeof StockOut>

  @hasMany(() => StockOut, {
    foreignKey: 'postedBy',
  })
  declare postedStockOuts: HasMany<typeof StockOut>

  @hasMany(() => StockTransfer, {
    foreignKey: 'transferBy',
  })
  declare transferByUser: HasMany<typeof StockTransfer>

  @hasMany(() => StockTransfer, {
    foreignKey: 'approvedBy',
  })
  declare approvedStockTransfers: HasMany<typeof StockTransfer>

  @hasMany(() => StockTransfer, {
    foreignKey: 'rejectedBy',
  })
  declare rejectedStockTransfers: HasMany<typeof StockTransfer>

  @hasMany(() => AccessToken)
  declare accessTokens: HasMany<typeof AccessToken>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
