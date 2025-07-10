import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cuti_type'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nm_tipe_cuti', 100).notNullable().unique()
      table.string('kode_cuti', 20).nullable().unique()
      table.text('deskripsi').nullable()
      table.integer('jatah_cuti').defaultTo(0)
      table.boolean('is_paid').defaultTo(true)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
