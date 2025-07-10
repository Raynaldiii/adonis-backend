import vine from '@vinejs/vine'

export const warehouseValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(30),
    address: vine.string().minLength(1).maxLength(255),
    code: vine.string().minLength(1).maxLength(30),
    phone: vine.string().minLength(1).maxLength(30),
    email: vine.string().minLength(1).maxLength(30),
  })
)

