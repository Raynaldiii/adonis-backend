import vine from '@vinejs/vine'

export const createDepartemenValidator = vine.compile(
  vine.object({
    nm_departemen: vine.string(),
    divisi_id: vine.number(),
  })
)
