import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cabang'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nm_cabang').notNullable()
      table.text('alamat_cabang').notNullable()
      table.string('kode_cabang').notNullable()
      table
        .integer('perusahaan_id')
        .unsigned()
        .references('id')
        .inTable('perusahaan')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
