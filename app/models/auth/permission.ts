import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import MenuGroup from '#models/menu_group'
import MenuDetail from '#models/menu_detail'
import Role from '#models/auth/role'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => MenuGroup, {
    pivotTable: 'menu_group_permission',
    localKey: 'id',
    pivotForeignKey: 'permission_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'menu_group_id',
  })
  declare menuGroups: ManyToMany<typeof MenuGroup>

  @manyToMany(() => MenuDetail, {
    pivotTable: 'menu_detail_permission',
    localKey: 'id',
    pivotForeignKey: 'permission_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'menu_detail_id',
  })
  declare menuDetails: ManyToMany<typeof MenuDetail>

  @manyToMany(() => Role, {
    pivotTable: 'permission_role',
    localKey: 'id',
    pivotForeignKey: 'permission_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>
}
