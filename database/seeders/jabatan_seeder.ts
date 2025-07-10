import Jabatan from '#models/jabatan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class JabatanSeeder extends BaseSeeder {
  public async run() {
    await Jabatan.createMany([
      { nm_jabatan: 'Direktur Utama' },
      { nm_jabatan: 'Direktur Keuangan' },
      { nm_jabatan: 'Direktur Operasional' },
      { nm_jabatan: 'General Manager' },
    ])
  }
}
