import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_transfers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('no_transfer').unique()
      table.integer('perusahaan_id').unsigned().references('id').inTable('perusahaan').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('cabang_id').unsigned().references('id').inTable('cabang').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('from_warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('to_warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('date')
      table.integer('transfer_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('rejected_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.text('description').nullable()
      table.enum('status', ['draft', 'submitted', 'approved', 'rejected']).defaultTo('draft')

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('approved_at')
      table.timestamp('rejected_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}