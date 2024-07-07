import {createError, defineEventHandler, readBody} from 'h3'
import {generateAuthenticationOptionsForUser, verifyAuthenticationForUser} from '~/server/services/webauthn'
import {createSession} from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (!body.response) {
            // Step 1: Generate authentication options
            const { email } = body
            if (!email) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email is required'
                })
            }
            return await generateAuthenticationOptionsForUser(email)
        } else {
            // Step 2: Verify authentication
            const { email, response } = body
            if (!email || !response) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email and response are required'
                })
            }
            const verification = await verifyAuthenticationForUser(email, response)
            if (verification.verified) {
                const sessionId = await createSession(email)
                return { verified: true, sessionId }
            }
            return { verified: false }
        }
    } catch (error) {
        console.error('Authentication error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        })
    }
})
