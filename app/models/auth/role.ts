import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/auth/user'
import Permission from '#models/auth/permission'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'role_user',
  })
  public users!: ManyToMany<typeof User>

  @manyToMany(() => Permission, {
    pivotTable: 'permission_roles',
  })
  public permissions!: ManyToMany<typeof Permission>
}
