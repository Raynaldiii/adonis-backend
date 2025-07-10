import vine from '@vinejs/vine'

export const perusahaanValidator = vine.compile(
  vine.object({
    nmPerusahaan    : vine.string().minLength(1).maxLength(30),
    alamatPerusahaan: vine.string().minLength(1).maxLength(255),
    tlpPerusahaan   : vine.string().minLength(1).maxLength(30),
    emailPerusahaan : vine.string().email().unique({ table: 'perusahaan', column: 'email_perusahaan' }),
    npwpPerusahaan  : vine.string().minLength(1).maxLength(30),
    kodePerusahaan  : vine.string().minLength(1).maxLength(30),
    logoPerusahaan  : vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
  })
)

export const updatePerusahaanValidator = vine.compile(
  vine.object({
    nmPerusahaan: vine.string().minLength(1).maxLength(30),
    alamatPerusahaan: vine.string().minLength(1).maxLength(255),
    tlpPerusahaan: vine.string().minLength(1).maxLength(30),
    emailPerusahaan: vine.string().email(),
    npwpPerusahaan: vine.string().minLength(1).maxLength(30),
    kodePerusahaan: vine.string().minLength(1).maxLength(30),
    logoPerusahaan: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
  })
)

export const cabangValidator = vine.compile(
  vine.object({
    nmCabang    : vine.string().minLength(1).maxLength(30),
    alamatCabang: vine.string().minLength(1).maxLength(255),
    perusahaanId: vine.number().max(11),
    kodeCabang  : vine.string().minLength(1).maxLength(30),
  })
)
