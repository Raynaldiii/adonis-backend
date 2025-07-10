import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_transfer_details'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('stock_transfer_id').references('id').inTable('stock_transfers').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('quantity')
      table.string('description').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}