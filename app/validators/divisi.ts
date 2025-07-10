import vine from '@vinejs/vine'

export const createDivisiValidator = vine.compile(
  vine.object({
    nm_divisi: vine.string(),
  })
)
