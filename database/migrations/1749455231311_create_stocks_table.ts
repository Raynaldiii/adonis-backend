import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE').onUpdate('CASCADE')
      table.decimal('quantity', 14, 2).defaultTo(0).notNullable()
      table.string('description').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}