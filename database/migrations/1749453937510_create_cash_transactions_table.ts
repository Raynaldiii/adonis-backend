import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cash_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
        table.uuid('id').primary()
        table.enum('type', ['in', 'out']).notNullable()
        table.uuid('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').onUpdate('CASCADE').notNullable()
        table.decimal('amount', 14, 2).notNullable()
        table.date('date').notNullable()
        table.string('source_type').nullable()
        table.integer('source_id').unsigned().nullable()
        table.text('description').nullable()
        
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}