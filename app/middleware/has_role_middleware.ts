// has_role_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/auth/user'
import logger from '@adonisjs/core/services/logger'

export default class HasRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, requiredRoles: string[]) {
    const { auth, response } = ctx

    // Authenticate user
    try {
      const authUser = auth.user
      if (!authUser) {
        logger.warn('Role check failed: No authenticated user')
        return response.unauthorized({
          error: 401,
          message: 'Authentication required to access this resource',
        })
      }

      // Re-fetch user from DB with roles to ensure data is fresh
      const user = await User.query().where('id', authUser.id).preload('roles').first()

      if (!user) {
        logger.warn(`Role check failed: User with ID ${authUser.id} not found in database.`)
        return response.unauthorized({
          error: 401,
          message: 'User not found.',
        })
      }

      // Extract role names
      const userRoles = user.roles.map((role) => role.name)

      logger.debug(`User ${user.id} roles: ${userRoles.join(', ')}`)
      logger.debug(`Required roles: ${requiredRoles.join(', ')}`)

      // Check if user has at least one required role
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))

      if (!hasRequiredRole) {
        logger.warn(
          `Role check failed for user ${user.id}. Missing required role(s): ${requiredRoles.join(', ')}`
        )
        return response.forbidden({
          error: 403,
          message: 'Insufficient roles to access this resource',
        })
      }

      return await next()
    } catch (error) {
      logger.error('Role check error:', error)
      return response.internalServerError({
        error: 500,
        message: 'An error occurred while checking roles',
      })
    }
  }
}
