import vine from '@vinejs/vine'

export const unitValidator = vine.compile(
  vine.object({
    name: vine.string(),
    symbol: vine.string(),
  })
)
