import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'

export default class Divisi extends BaseModel {
  public static table = 'divisi'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nm_divisi: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Pegawai)
  declare pegawai: HasOne<typeof Pegawai>
}
