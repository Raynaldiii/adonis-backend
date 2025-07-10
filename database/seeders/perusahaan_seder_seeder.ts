import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Perusahaan from '#models/perusahaan'
import Cabang from '#models/cabang'
import Divisi from '#models/divisi'
import Departemen from '#models/departemen'

export default class extends BaseSeeder {
  public async run() {
    // Seed Perusahaan
    const perusahaan = await Perusahaan.create({
      nm_perusahaan: 'PT Contoh Sejahtera',
      alamat_perusahaan: 'Jl. Mawar No. 123, Jakarta',
      email_perusahaan: 'test@gmail.com',
      tlp_perusahaan: '0812763872163',
      npwp_perusahaan: '01.234.567.8-999.000',
      kode_perusahaan: '001',
      logo_perusahaan: 'logo.png',
    })

    // Seed Cabang
    await Cabang.createMany([
      {
        nm_cabang: 'Cabang Jakarta',
        alamat_cabang: 'Jl. Melati No. 1, Jakarta',
        perusahaanId: perusahaan.id,
        kode_cabang: '001',
      },
      {
        nm_cabang: 'Cabang Bandung',
        alamat_cabang: 'Jl. Kenanga No. 2, Bandung',
        perusahaanId: perusahaan.id,
        kode_cabang: '002',
      },
    ])

    // Seed Divisi
    const divisiList = await Divisi.createMany([
      { nm_divisi: 'Divisi Keuangan' },
      { nm_divisi: 'Divisi Operasional' },
      { nm_divisi: 'Divisi SDM' },
      { nm_divisi: 'Divisi IT' },
    ])

    // Seed Departemen
    await Departemen.createMany([
      { nm_departemen: 'Departemen Akuntansi', divisi_id: divisiList[0].id },
      { nm_departemen: 'Departemen Produksi', divisi_id: divisiList[1].id },
      { nm_departemen: 'Departemen HRD', divisi_id: divisiList[2].id },
      { nm_departemen: 'Departemen IT', divisi_id: divisiList[3].id },
    ])
  }
}
