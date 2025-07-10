import vine from '@vinejs/vine'

export const customerValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(30),
    address: vine.string().minLength(1).maxLength(255),
    email: vine.string().minLength(1).maxLength(30),
    phone: vine.string().minLength(1).maxLength(30),
    npwp: vine.string().minLength(1).maxLength(30),
    logo: vine.file().optional(),

    customerProducts: vine.array(
      vine.object({
        productId: vine.number(),
        priceSell: vine.number(),
      })
    ).optional(),
  })
)