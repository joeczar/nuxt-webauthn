import { defineEventHandler, getHeader } from 'h3'
import { deleteSession } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const sessionId = authHeader.split(' ')[1]
    await deleteSession(sessionId)
  }

  return { success: true }
})
