// validators/menu_group.ts
import vine from '@vinejs/vine'

export const createMenuGroupValidator = vine.compile(
  vine.object({
    name: vine.string(),
    icon: vine.string(),
    order: vine.number(),
    jenisMenu: vine.number(),
  })
)

export const updateMenuGroupValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    icon: vine.string().optional(),
    order: vine.number().optional(),
    jenisMenu: vine.number().optional(),
  })
)

export const createMenuDetailValidator = vine.compile(
  vine.object({
    name: vine.string(),
    route: vine.string(),
    status: vine.number(),
    order: vine.number(),
    menuGroupId: vine.number(),
  })
)

export const updateMenuDetailValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    route: vine.string().optional(),
    status: vine.number().optional(),
    order: vine.number().optional(),
    menuGroupId: vine.number().optional(),
  })
)
