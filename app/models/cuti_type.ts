// Model Cuti Type (Updated)
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CutiBalance from '#models/cuti_balance'
import Cuti from '#models/cuti' // Import Cuti model

export default class CutiType extends BaseModel {
  public static table = 'cuti_type'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nmTipeCuti: string

  @column()
  declare kodeCuti: string | null

  @column()
  declare deskripsi: string | null

  @column()
  declare jatahCuti: number

  @column()
  declare isPaid: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => CutiBalance, {
    foreignKey: 'cuti_type_id',
  })
  declare balances: HasMany<typeof CutiBalance>

  @hasMany(() => Cuti, {
    foreignKey: 'cuti_type_id',
    localKey: 'id',
  })
  declare applications: HasMany<typeof Cuti>
}
