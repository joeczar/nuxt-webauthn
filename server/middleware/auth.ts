import { defineEventHandler, getHeader, createError } from 'h3'
import { getSessionWithId } from '../utils/sessionStore'

export default defineEventHandler(async (event) => {
  const publicApiPaths = ['/api/auth/register', '/api/auth/login', '/api/auth/verify-registration']
  const publicClientPaths = ['/', '/register', '/login']
  const publicPaths = [...publicClientPaths, ...publicApiPaths]
  if (event.path && publicPaths.some((p) => event.path.startsWith(p))) {
    return // Allow access to public paths
  }

  const sessionId = getHeader(event, 'x-session-id')
  if (!sessionId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No session ID provided',
    })
  }

  const userId = await getSessionWithId(sessionId)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid session',
    })
  }

  event.context.userId = userId
})
