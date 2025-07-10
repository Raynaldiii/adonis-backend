import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pegawai_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pegawai_id')
        .unsigned()
        .references('id_pegawai')
        .inTable('pegawai')
        .onDelete('CASCADE')

      table
        .integer('jabatan_id')
        .unsigned()
        .references('id_jabatan')
        .inTable('jabatan')
        .onDelete('CASCADE')
      table
        .integer('perusahaan_id')
        .unsigned()
        .references('id')
        .inTable('perusahaan')
        .onDelete('CASCADE')
      table.integer('cabang_id').unsigned().references('id').inTable('cabang').onDelete('CASCADE')
      table.integer('divisi_id').unsigned().references('id').inTable('divisi').onDelete('CASCADE')
      table
        .integer('departemen_id')
        .unsigned()
        .references('id')
        .inTable('departemen')
        .onDelete('CASCADE')

      table.decimal('gaji_pegawai', 12, 2).notNullable()
      table.decimal('tunjangan_pegawai', 12, 2).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
