import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import MenuGroup from '#models/menu_group'
import Permission from '#models/auth/permission'

export default class MenuDetail extends BaseModel {
  public static table = 'menu_detail'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare route: string

  @column()
  declare status: number

  @column()
  declare order: number

  @column()
  declare menuGroupId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => MenuGroup)
  menuGroup!: BelongsTo<typeof MenuGroup>

  @manyToMany(() => Permission, {
    pivotTable: 'menu_detail_permission',
  })
  permissions!: ManyToMany<typeof Permission>
}
