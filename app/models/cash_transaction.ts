import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'

export default class CashTransaction extends BaseModel {
  public static table = 'cash_transactions'

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare type: string

  @column()
  declare accountId: number

  @column()
  declare amount: number

  @column()
  declare date: Date

  @column()
  declare sourceType: string

  @column()
  declare sourceId: number

  @column()
  declare description: string

  @belongsTo(() => Account, { foreignKey: 'accountId', localKey: 'id' })
  declare account: BelongsTo<typeof Account>
}