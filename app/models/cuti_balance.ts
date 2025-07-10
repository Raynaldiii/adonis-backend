import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'
import CutiType from '#models/cuti_type'

export default class CutiBalance extends BaseModel {
  public static table = 'cuti_balance'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pegawaiId: number

  @column()
  declare cuti_type_id: number

  @column()
  declare tahun: number

  @column()
  declare sisa_jatah_cuti: number

  @column()
  declare cuti_terpakai: number

  @column()
  declare sisa_cuti_tahun_lalu: number

  @column.date()
  declare valid_sampai: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pegawai, {
    foreignKey: 'pegawaiId',
    localKey: 'id_pegawai',
  })
  declare pegawai: BelongsTo<typeof Pegawai>

  @belongsTo(() => CutiType, {
    foreignKey: 'cuti_type_id',
  })
  declare cutiType: BelongsTo<typeof CutiType>
}
