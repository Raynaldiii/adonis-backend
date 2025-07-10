import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'perusahaan'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nm_perusahaan').notNullable()
      table.string('kode_perusahaan').notNullable()
      table.text('alamat_perusahaan').notNullable()
      table.text('tlp_perusahaan').notNullable()
      table.text('email_perusahaan').notNullable()
      table.string('npwp_perusahaan').notNullable()
      table.string('logo_perusahaan').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
