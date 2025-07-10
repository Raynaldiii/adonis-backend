import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'

export default class Jabatan extends BaseModel {
  public static table = 'jabatan'

  @column({ isPrimary: true })
  declare id_jabatan: number

  @column()
  declare nm_jabatan: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Pegawai)
  declare pegawai: HasMany<typeof Pegawai>
}
