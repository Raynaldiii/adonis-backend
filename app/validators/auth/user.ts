// userValidator.ts
import vine from '@vinejs/vine'

export const userValidator = vine.compile(
  vine.object({
    full_name: vine.string(),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(32),
    isActive: vine.boolean(),
    role_ids: vine.array(vine.number()),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    full_name: vine.string(),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(32).optional(),
    isActive: vine.boolean(),
    role_ids: vine.array(vine.number()).optional(),
  })
)
