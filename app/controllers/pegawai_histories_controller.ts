import type { HttpContext } from '@adonisjs/core/http'
import PegawaiHistory from '#models/pegawai_history'
import { DateTime } from 'luxon'

export default class PegawaiHistoriesController {
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'pegawaiId',
      'jabatanId',
      'perusahaanId',
      'cabangId',
      'divisiId',
      'departemenId',
      'gaji_pegawai',
      'tunjangan_pegawai',
    ])

    // Tutup histori sebelumnya
    await PegawaiHistory.query()
      .where('pegawai_id', data.pegawaiId)
      .update({ updated_at: DateTime.now() })

    // Simpan histori baru
    const riwayat = await PegawaiHistory.create({
      ...data,
    })

    return response.created(riwayat)
  }
}
