import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pegawai'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_pegawai')
      table.string('nm_pegawai').notNullable()
      table.date('tgl_lahir_pegawai').notNullable()
      table.string('tmp_lahir_pegawai').notNullable()
      table.text('alamat_pegawai').notNullable()
      table.string('no_tlp_pegawai').notNullable()
      table.integer('pendidikan_pegawai').notNullable()
      table.integer('status_pegawai').notNullable()
      table.string('no_ktp_pegawai').notNullable()
      table.string('npwp_pegawai').notNullable()
      table.string('nik_pegawai').notNullable()
      table.tinyint('jenis_kelamin_pegawai').notNullable()
      table.date('tgl_masuk_pegawai').notNullable()
      table.date('tgl_keluar_pegawai').nullable()
      table.string('istri_suami_pegawai').nullable()
      table.string('anak_1').nullable()
      table.string('anak_2').nullable()
      table.string('avatar').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
