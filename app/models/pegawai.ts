import { DateTime } from 'luxon'
import { column, BaseModel, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import PegawaiHistory from '#models/pegawai_history'
import Users from '#models/auth/user'
import CutiBalance from '#models/cuti_balance'

export default class Pegawai extends BaseModel {
  public static table = 'pegawai'

  @column({ isPrimary: true, columnName: 'id_pegawai' })
  declare id_pegawai: number

  @column()
  declare nm_pegawai: string

  @column.date()
  declare tgl_lahir_pegawai: DateTime

  @column()
  declare tmp_lahir_pegawai: string

  @column()
  declare no_tlp_pegawai: string

  @column()
  declare pendidikan_pegawai: number

  @column()
  declare alamat_pegawai: string

  @column()
  declare status_pegawai: number

  @column()
  declare no_ktp_pegawai: string

  @column()
  declare nik_pegawai: string

  @column()
  declare npwp_pegawai: string

  @column()
  declare jenis_kelamin_pegawai: number

  @column.date()
  declare tgl_masuk_pegawai: DateTime

  @column.date()
  declare tgl_keluar_pegawai: DateTime | null

  @column()
  declare istri_suami_pegawai: string | null

  @column()
  declare anak_1: string | null

  @column()
  declare anak_2: string | null

  @column()
  declare avatar: string | null

  @column()
  declare user_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PegawaiHistory, {
    foreignKey: 'pegawai_id',
  })
  declare PegawaiHistory: HasMany<typeof PegawaiHistory>


  @hasMany(() => CutiBalance)
  declare CutiBalance: HasMany<typeof CutiBalance>

  @belongsTo(() => Users, {
    foreignKey: 'user_id',
    localKey: 'id',
  })
  declare users: BelongsTo<typeof Users>
}
