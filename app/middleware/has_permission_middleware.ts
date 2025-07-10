// has_permission_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'
import { Authenticators } from '@adonisjs/auth/types'

export default class HasPermissionMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    permissions: string[]
  ) {
    const { auth } = ctx
    const user = auth.user!

    await user.load('roles', (query) => {
      query.preload('permissions')
    })

    const userPermissions = user.roles.flatMap((role) => role.permissions.map((p) => p.name))

    const hasPermission = permissions.some((p) => userPermissions.includes(p))

    if (!hasPermission) {
      return ctx.response.unauthorized({
        error: `You are not authorized to perform this action. Required permissions: ${permissions.join(', ')}`,
      })
    }

    return next()
  }
}
