import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import MenuDetail from '#models/menu_detail'
import Permission from '#models/auth/permission'

export default class MenuGroup extends BaseModel {
  public static table = 'menu_group'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare icon: string

  @column()
  declare order: number

  @column()
  declare jenisMenu: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => MenuDetail)
  menuDetails!: HasMany<typeof MenuDetail>

  @manyToMany(() => Permission, {
    pivotTable: 'menu_group_permission',
  })
  permissions!: ManyToMany<typeof Permission>
}
