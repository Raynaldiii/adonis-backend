import vine from '@vinejs/vine'

export const createCutiValidator = vine.compile(
  vine.object({
    cuti_type_id: vine.number().exists(async (db, value) => {
      const cutiType = await db.query().from('cuti_type').where('id', value).first()
      return !!cutiType
    }),
    tanggalMulai: vine.date(),
    tanggalSelesai: vine.date(),
    alasan: vine.string().escape().maxLength(500).optional(),
    attachment: vine.string().url().nullable().optional(),
  })
)

export const createCutiBalanceValidator = vine.compile(
  vine.object({
    pegawai_id: vine.number(),
    tahun: vine.number(),
    sisa_cuti: vine.number().min(0),
    cuti_diambil: vine.number().min(0),
    keterangan: vine.string().trim().nullable().optional(),
    cuti_type_id: vine.number(),
    valid_sampai: vine
      .date({ formats: ['yyyy-MM-dd'] })
      .nullable()
      .optional(),
  })
)

export const updateCutiValidator = vine.compile(
  vine.object({
    cuti_type_id: vine.number().optional(),
    tanggalMulai: vine.date().optional(),
    tanggalSelesai: vine.date().optional(),
    lama_cuti: vine.number().positive().optional(),
    alasan: vine.string().escape().maxLength(500).optional(),
    attachment: vine.string().url().nullable().optional(),
    pegawai_id: vine.number().optional(),
    status: vine.enum([0, 1, 2, 3]).optional(),
    alasan_ditolak: vine.string().escape().maxLength(500).optional().nullable(),
  })
)
