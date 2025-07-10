import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from './account.js'
import Journal from './journal.js'

export default class JournalLine extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare journalId: string

  @column()
  declare accountId: number

  @column()
  declare debit: number

  @column()
  declare credit: number

  @belongsTo(() => Journal)
  declare journal: BelongsTo<typeof Journal>

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>
}