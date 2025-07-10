import vine from '@vinejs/vine'

export const createJabatanValidator = vine.compile(
  vine.object({
    nm_jabatan: vine.string(),
  })
)
