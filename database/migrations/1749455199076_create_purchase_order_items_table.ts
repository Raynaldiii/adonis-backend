import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('purchase_order_id').references('id').inTable('purchase_orders').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE').onUpdate('CASCADE').nullable()
      table.decimal('quantity', 12, 2).notNullable()
      table.decimal('price', 14, 2).notNullable()
      table.decimal('subtotal', 14, 2).notNullable()
      table.decimal('received_qty', 12, 2).defaultTo(0).notNullable()
      table.boolean('status_partial').defaultTo(false)
      table.text('description').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}