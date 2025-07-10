import vine from '@vinejs/vine'

export const stockTransferValidator = vine.compile(
  vine.object({
    perusahaanId   : vine.number(),
    cabangId       : vine.number(),
    fromWarehouseId: vine.number(),
    toWarehouseId  : vine.number(),
    date           : vine.date(),
    description    : vine.string().optional(),
    status         : vine.enum(['draft', 'approved', 'rejected'] as const).optional(),
    transferBy     : vine.number().optional(),
    approvedBy     : vine.number().optional(),
    rejectedBy     : vine.number().optional(),

    stockTransferDetails: vine.array(
      vine.object({
        productId    : vine.number(),
        quantity     : vine.number(),
        description  : vine.string().optional(),
      })
    ).minLength(1),
  })
)

export const updateStockTransferValidator = vine.compile(
  vine.object({
    perusahaanId   : vine.number(),
    cabangId       : vine.number(),
    fromWarehouseId: vine.number(),
    toWarehouseId  : vine.number(),
    date           : vine.date(),
    description    : vine.string().optional(),
    approvedBy     : vine.number().optional(),
    rejectedBy     : vine.number().optional(),

    stockTransferDetails: vine.array(
      vine.object({
        productId    : vine.number(),
        quantity     : vine.number(),
        description  : vine.string().optional(),
      })
    ).minLength(1),
  })
)
