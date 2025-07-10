import vine from '@vinejs/vine'

export const updateStockInValidator = vine.compile(
  vine.object({
    date: vine.date(),
    warehouseId: vine.number(),
    status: vine.string(),
  })
)
