import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('perusahaan_id').unsigned().references('id').inTable('perusahaan').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('cabang_id').unsigned().references('id').inTable('cabang').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('no_po').nullable()
      table.string('no_so').notNullable()
      table.string('up').notNullable()
      table.date('date').notNullable()
      table.date('due_date').notNullable()
      table.enum('status', ['draft', 'approved', 'rejected', 'partial', 'delivered']).defaultTo('draft')
      table.enum('payment_method', ['cash', 'transfer', 'qris', 'card']).defaultTo('cash')
      table.enum('source', ['pos', 'admin'])
      table.decimal('total', 14, 2).notNullable()
      table.decimal('discount_percent', 5, 2).defaultTo(0)
      table.decimal('tax_percent', 5, 2).defaultTo(0)
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('rejected_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('delivered_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.text('description').nullable()
      table.string('attachment').nullable()
      table.timestamp('approved_at').nullable()
      table.timestamp('rejected_at').nullable()
      table.timestamp('delivered_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}