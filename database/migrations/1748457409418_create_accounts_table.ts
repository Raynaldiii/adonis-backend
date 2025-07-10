import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('code').notNullable().unique()
      table.string('name').notNullable()
      table.enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']).notNullable()
      table.boolean('is_parent').defaultTo(false)
      table.uuid('parent_id').references('id').inTable('accounts').onDelete('SET NULL')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}