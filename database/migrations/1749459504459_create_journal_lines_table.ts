import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'journal_lines'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
      table.uuid('journal_id').unsigned().references('id').inTable('journals').onDelete('CASCADE')
      table.uuid('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.decimal('debit', 14, 2).defaultTo(0)
      table.decimal('credit', 14, 2).defaultTo(0)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}