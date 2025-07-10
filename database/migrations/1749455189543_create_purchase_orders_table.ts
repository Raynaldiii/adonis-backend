import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('CASCADE').onUpdate('CASCADE').notNullable()
      table.integer('perusahaan_id').unsigned().references('id').inTable('perusahaan').onDelete('CASCADE').onUpdate('CASCADE').notNullable()
      table.integer('cabang_id').unsigned().references('id').inTable('cabang').onDelete('CASCADE').onUpdate('CASCADE').notNullable()
      table.string('no_po').notNullable().unique()
      table.string('up').notNullable()
      table.date('date').notNullable()
      table.date('due_date').notNullable()
      table.enum('status', ['draft', 'approved', 'rejected', 'partial', 'received']).defaultTo('draft')
      table.decimal('total', 14, 2).notNullable()
      table.decimal('discount_percent', 5, 2).defaultTo(0).notNullable()
      table.decimal('tax_percent', 5, 2).defaultTo(0).notNullable()
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('rejected_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('received_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamp('approved_at').nullable()
      table.timestamp('rejected_at').nullable()
      table.timestamp('received_at').nullable()
      table.text('description').nullable()
      table.string('attachment').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}