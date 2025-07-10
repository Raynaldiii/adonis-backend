import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    full_name: vine.string().minLength(3).maxLength(100),
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(6),
    isActive: vine.boolean().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)
