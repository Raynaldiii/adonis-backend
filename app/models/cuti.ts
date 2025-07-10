import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pegawai from '#models/pegawai'
import CutiType from '#models/cuti_type'

export default class Cuti extends BaseModel {
  public static table = 'cuti'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cutiTypeId: number

  @column.date()
  declare tanggalMulai: DateTime

  @column.date()
  declare tanggalSelesai: DateTime

  @column()
  declare lamaCuti: number

  @column()
  declare alasan: string

  @column()
  declare status: number

  @column()
  declare approvedBy: number | null

  @column.date()
  declare approval_date: DateTime | null

  @column()
  declare alasanDitolak: string | null

  @column()
  declare attachment: string | null

  @column()
  declare pegawaiId: number

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
    foreignKey: 'cutiTypeId',
    localKey: 'id',
  })
  declare cutiType: BelongsTo<typeof CutiType>
}
