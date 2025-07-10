// database/seeders/CutiTypeSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import CutiType from '#models/cuti_type'
import CutiBalance from '#models/cuti_balance'

export default class extends BaseSeeder {
  async run() {
    await CutiType.createMany([
      {
        nmTipeCuti: 'Cuti Tahunan',
        kodeCuti: 'CT',
        deskripsi: 'Jatah cuti tahunan bagi pegawai sesuai masa kerja',
        jatahCuti: 12, // 12 hari
        isPaid: true,
        isActive: true,
      },
      {
        nmTipeCuti: 'Cuti Sakit',
        kodeCuti: 'CS',
        deskripsi: 'Cuti karena sakit dengan melampirkan surat keterangan dokter',
        jatahCuti: 0,
        isPaid: true,
        isActive: true,
      },
      {
        nmTipeCuti: 'Cuti Melahirkan',
        kodeCuti: 'CM',
        deskripsi: 'Cuti khusus bagi karyawan wanita yang melahirkan',
        jatahCuti: 90, // 90 hari (3 bulan)
        isPaid: true,
        isActive: true,
      },
      {
        nmTipeCuti: 'Cuti Besar',
        kodeCuti: 'CB',
        deskripsi: 'Cuti yang diberikan setelah masa kerja tertentu (misal 5 tahun)',
        jatahCuti: 0, // Jatah bisa diatur per kebijakan, atau akumulatif
        isPaid: true,
        isActive: true,
      },
      {
        nmTipeCuti: 'Cuti Tidak Dibayar',
        kodeCuti: 'CTB',
        deskripsi: 'Cuti yang tidak dibayar gaji, diajukan untuk keperluan pribadi',
        jatahCuti: 0,
        isPaid: false,
        isActive: true,
      },
    ])

    await CutiBalance.query().delete()

    const currentYear = DateTime.now().year

    await CutiBalance.createMany([
      {
        pegawaiId: 1,
        cuti_type_id: 1,
        tahun: currentYear,
        sisa_jatah_cuti: 12,
        cuti_terpakai: 0,
        sisa_cuti_tahun_lalu: 0,
        valid_sampai: DateTime.local(currentYear, 12, 31),
      },
      {
        pegawaiId: 1,
        cuti_type_id: 2,
        tahun: currentYear,
        sisa_jatah_cuti: 999,
        cuti_terpakai: 0,
        sisa_cuti_tahun_lalu: 0,
        valid_sampai: null,
      },
    ])
  }
}
