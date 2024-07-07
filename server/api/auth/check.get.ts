import { defineEventHandler, getHeader } from 'h3'
import { getSessionWithId } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
    const authHeader = getHeader(event, 'Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false }
    }

    const sessionId = authHeader.split(' ')[1]
    const userId = await getSessionWithId(sessionId)

    if (!userId) {
        return { authenticated: false }
    }

    // Here you would typically fetch the user data from your database
    // For now, we'll just return the user ID
    return { authenticated: true, userId }
})