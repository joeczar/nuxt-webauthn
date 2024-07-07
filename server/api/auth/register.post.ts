import { defineEventHandler, readBody, createError } from 'h3'
import { generateRegistrationOptionsForUser, verifyRegistrationForUser } from '~/server/services/webauthn'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (!body.response) {
            // Step 1: Generate registration options
            const { email } = body
            console.log({email})
            if (!email) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email is required'
                })
            }
            const options = await generateRegistrationOptionsForUser(email)
            return options
        } else {
            // Step 2: Verify registration
            const { email, response } = body
            if (!email || !response) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email and response are required'
                })
            }
            const verification = await verifyRegistrationForUser(email, response)
            if (verification.verified) {
                // Handle successful verification (e.g., create session)
                return { verified: true }
            }
            return { verified: false }
        }
    } catch (error) {
        console.error('Registration error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        })
    }
})