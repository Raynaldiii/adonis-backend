import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import JournalLine from './journal_line.js'
import CashTransaction from './cash_transaction.js'

export default class Account extends BaseModel {
  public static table = 'accounts'

  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

  @column()
  declare isParent: boolean

  @column()
  declare parentId: string

  @belongsTo(() => Account)
  declare parent: BelongsTo<typeof Account>

  @hasMany(() => Account)
  declare children: HasMany<typeof Account>

  @hasMany(() => JournalLine)
  declare journalLines: HasMany<typeof JournalLine>

  @hasMany(() => CashTransaction)
  declare cashTransactions: HasMany<typeof CashTransaction>
}