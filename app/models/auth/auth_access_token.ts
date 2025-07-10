import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/auth/user'
import { DateTime } from 'luxon'

export default class AuthAccessToken extends BaseModel {
  static table = 'auth_access_tokens'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tokenableId: number

  @column()
  declare type: string

  @column()
  declare name: string

  @column()
  declare hash: string

  @column.dateTime()
  declare expiresAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id', localKey: 'id' })
  declare user: BelongsTo<typeof User>
}
