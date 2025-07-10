import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cuti'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.date('tanggal_mulai').notNullable()
      table.date('tanggal_selesai').notNullable()
      table.integer('lama_cuti').notNullable()
      table.text('alasan').notNullable()
      table.integer('status').notNullable()
      table.integer('approved_by').unsigned().nullable()
      table.date('approval_date').nullable()
      table.text('alasan_ditolak').nullable()
      table.string('attachment').nullable()
      table
        .integer('pegawai_id')
        .unsigned()
        .references('id_pegawai')
        .inTable('pegawai')
        .onDelete('CASCADE')
      table
        .integer('cuti_type_id')
        .unsigned()
        .references('id')
        .inTable('cuti_type')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
