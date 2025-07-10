import vine from '@vinejs/vine'

export const createStockOutValidator = vine.compile(
  vine.object({
    noSo: vine.string().unique(async (db, value) => {
      const stockOut = await db.from('stock_outs').where('no_so', value).first()
      return !stockOut
    }),
    date: vine.date(),
    warehouseId: vine.number(),
  })
)

export const updateStockOutValidator = vine.compile(
  vine.object({
    noSo: vine.string(),
    date: vine.date(),
    warehouseId: vine.number(),
    status: vine.string(),
  })
)
