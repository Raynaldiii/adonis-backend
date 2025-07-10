import vine from '@vinejs/vine'

export const salesOrderValidator = vine.compile(
  vine.object({
    customerId     : vine.number(),
    perusahaanId   : vine.number(),
    cabangId       : vine.number(),
    noPo           : vine.string().optional(),
    noSo           : vine.string().unique({ table: 'sales_orders', column: 'no_so' }).optional(),
    up             : vine.string(),
    date           : vine.date(),
    dueDate        : vine.date(),
    status         : vine.enum(['draft', 'approved', 'rejected', 'delivered', 'partial'] as const),
    paymentMethod  : vine.enum(['cash', 'transfer', 'qris', 'card'] as const),
    source         : vine.enum(['pos', 'admin'] as const),
    discountPercent: vine.number(),
    taxPercent     : vine.number(),
    createdBy      : vine.number(),
    approvedBy     : vine.number().optional(),
    deliveredBy    : vine.number().optional(),
    rejectedBy     : vine.number().optional(),
    description    : vine.string().optional(),
    approvedAt     : vine.date().optional(),
    deliveredAt    : vine.date().optional(),
    rejectedAt     : vine.date().optional(),
    attachment: vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'pdf', 'docs']
    }).optional(),

    salesOrderItems: vine.array(
      vine.object({
        productId    : vine.number(),
        quantity     : vine.number(),
        price        : vine.number(),
        subtotal     : vine.number(),
        warehouseId  : vine.number().optional(),
        description  : vine.string().optional(),
        statusPartial: vine.boolean().optional(),
        deliveredQty  : vine.number().optional(),
      })
    ).minLength(1),
  })
)

export const updateSalesOrderValidator = vine.compile(
  vine.object({
    customerId     : vine.number(),
    perusahaanId   : vine.number(),
    cabangId       : vine.number(),
    noPo           : vine.string().optional(),
    noSo           : vine.string().optional(),
    up             : vine.string(),
    date           : vine.date(),
    dueDate        : vine.date(),
    status         : vine.enum(['draft', 'approved', 'rejected', 'delivered', 'partial'] as const).optional(),
    paymentMethod  : vine.enum(['cash', 'transfer', 'qris', 'card'] as const).optional(),
    source         : vine.enum(['pos', 'admin'] as const).optional(),
    discountPercent: vine.number(),
    taxPercent     : vine.number(),
    createdBy      : vine.number().optional(),
    approvedBy     : vine.number().optional(),
    deliveredBy    : vine.number().optional(),
    rejectedBy     : vine.number().optional(),
    description    : vine.string().optional(),
    approvedAt     : vine.date().optional(),
    deliveredAt    : vine.date().optional(),
    rejectedAt     : vine.date().optional(),
    attachment: vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'pdf', 'docs']
    }).optional(),

    salesOrderItems: vine.array(
      vine.object({
        productId    : vine.number(),
        quantity     : vine.number(),
        price        : vine.number(),
        subtotal     : vine.number(),
        warehouseId  : vine.number().optional(),
        description  : vine.string().optional(),
        statusPartial: vine.boolean().optional(),
        deliveredQty  : vine.number().optional(),
      })
    ).minLength(1),
  })
)