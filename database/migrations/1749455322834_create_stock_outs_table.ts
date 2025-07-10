import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_outs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('no_so').unique()
      table.date('date').notNullable()
      table.string('description').nullable()
      table.uuid('sales_order_id').references('id').inTable('sales_orders').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('posted_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE').onUpdate('CASCADE')
      table.enum('status', ['draft', 'posted']).defaultTo('draft')

      table.timestamp('posted_at')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}