import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_in_details'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('stock_in_id').references('id').inTable('stock_ins').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('quantity').notNullable()
      table.text('description').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}