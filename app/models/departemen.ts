import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'
import Divisi from '#models/divisi'

export default class Departemen extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nm_departemen: string

  @column()
  declare divisi_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Divisi, {
    foreignKey: 'divisi_id',
    localKey: 'id',
  })
  declare divisi: BelongsTo<typeof Divisi>

  @hasOne(() => Pegawai)
  declare pegawai: HasOne<typeof Pegawai>
}
