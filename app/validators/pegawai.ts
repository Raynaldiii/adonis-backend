import vine from '@vinejs/vine'

export const createPegawaiValidator = vine.compile(
  vine.object({
    nm_pegawai: vine.string().minLength(1),
    email: vine.string().email().minLength(1),
    tgl_lahir_pegawai: vine.date(),
    tmp_lahir_pegawai: vine.string().minLength(1),
    no_tlp_pegawai: vine.string().minLength(1),
    alamat_pegawai: vine.string().minLength(1),
    pendidikan_pegawai: vine.number(),
    status_pegawai: vine.number().max(5).min(1),
    no_ktp_pegawai: vine.string().minLength(1),
    nik_pegawai: vine.string().minLength(1),
    npwp_pegawai: vine.string().minLength(1),
    jenis_kelamin_pegawai: vine.number().min(0).max(1),
    tgl_masuk_pegawai: vine.date(),
    tgl_keluar_pegawai: vine.date().nullable().optional(),
    istri_suami_pegawai: vine.string().nullable(),
    anak_1: vine.string().nullable(),
    anak_2: vine.string().nullable(),
    avatar: vine.file().nullable().optional(),
    user_id: vine.number().optional(),
  })
)

export const updatePegawaiValidator = vine.compile(
  vine.object({
    nm_pegawai: vine.string().minLength(1),
    tgl_lahir_pegawai: vine.date(),
    tmp_lahir_pegawai: vine.string().minLength(1),
    no_tlp_pegawai: vine.string().minLength(1),
    alamat_pegawai: vine.string().minLength(1),
    pendidikan_pegawai: vine.number(),
    status_pegawai: vine.number().max(5).min(1),
    no_ktp_pegawai: vine.string().minLength(1),
    nik_pegawai: vine.string().minLength(1),
    npwp_pegawai: vine.string().minLength(1),
    jenis_kelamin_pegawai: vine.number().min(0).max(1),
    tgl_masuk_pegawai: vine.date(),
    tgl_keluar_pegawai: vine.date().nullable().optional(),
    istri_suami_pegawai: vine.string().nullable(),
    anak_1: vine.string().nullable(),
    anak_2: vine.string().nullable(),
    avatar: vine.file().nullable().optional(),
    user_id: vine.number().optional(),
  })
)

export const pegawaiHistoryValidator = vine.compile(
  vine.object({
    pegawai_id: vine.number().optional(),
    jabatan_id: vine.number(),
    perusahaan_id: vine.number(),
    cabang_id: vine.number(),
    divisi_id: vine.number(),
    departemen_id: vine.number(),
    gaji_pegawai: vine.number(),
    tunjangan_pegawai: vine.number(),
  })
)
