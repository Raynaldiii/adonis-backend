import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales_invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('sales_order_id').references('id').inTable('sales_orders').onDelete('SET NULL').onUpdate('CASCADE').nullable()
      table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('date').notNullable()
      table.date('due_date').notNullable()
      table.decimal('discount_percent', 5, 2).defaultTo(0)
      table.decimal('tax_percent', 5, 2).defaultTo(0)
      table.decimal('total', 14, 2).notNullable()
      table.decimal('paid_amount', 14, 2).defaultTo(0)
      table.enum('status', ['unpaid', 'partial', 'paid']).defaultTo('unpaid')
      table.text('description').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}