import vine from '@vinejs/vine'

export const batchPermissionValidator = vine.compile(
  vine.object({
    permissions: vine.array(
      vine.object({
        name: vine.string().minLength(1),

        menuGroupIds: vine.array(
          vine.number().exists(async (db, value) => {
            const group = await db.from('menu_group').where('id', value).first()
            return !!group
          })
        ).minLength(1),

        menuDetailIds: vine.array(
          vine.number().exists(async (db, value) => {
            const detail = await db.from('menu_detail').where('id', value).first()
            return !!detail
          })
        ).minLength(1),
      })
    ),
  })
)

// Validator untuk create single permission
export const createPermissionValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1),
    menuGroupIds: vine.array(
      vine.number().exists(async (db, value) => {
        const group = await db.from('menu_group').where('id', value).first()
        return !!group
      })
    ).minLength(1),
    menuDetailIds: vine.array(
      vine.number().exists(async (db, value) => {
        const detail = await db.from('menu_detail').where('id', value).first()
        return !!detail
      })
    ).minLength(1),
  })
)
