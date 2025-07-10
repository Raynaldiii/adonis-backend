import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'
import Jabatan from '#models/jabatan'
import Perusahaan from '#models/perusahaan'
import Cabang from '#models/cabang'
import Divisi from '#models/divisi'
import Departemen from '#models/departemen'

export default class PegawaiHistory extends BaseModel {
  public static table = 'pegawai_history'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pegawai_id: number

  @column()
  declare jabatan_id: number

  @column()
  declare perusahaan_id: number

  @column()
  declare cabang_id: number

  @column()
  declare divisi_id: number

  @column()
  declare departemen_id: number

  @column()
  declare gaji_pegawai: number

  @column()
  declare tunjangan_pegawai: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pegawai)
  declare pegawai: BelongsTo<typeof Pegawai>

  @belongsTo(() => Jabatan, {
    foreignKey: 'jabatan_id',
  })
  declare jabatan: BelongsTo<typeof Jabatan>

  @belongsTo(() => Perusahaan, {
    foreignKey: 'perusahaan_id',
  })
  declare perusahaan: BelongsTo<typeof Perusahaan>

  @belongsTo(() => Cabang, {
    foreignKey: 'cabang_id',
  })
  declare cabang: BelongsTo<typeof Cabang>

  @belongsTo(() => Divisi, {
    foreignKey: 'divisi_id',
  })
  declare divisi: BelongsTo<typeof Divisi>

  @belongsTo(() => Departemen, {
    foreignKey: 'departemen_id',
  })
  declare departemen: BelongsTo<typeof Departemen>
}
