import { defineEventHandler, H3Error, readBody, createError } from 'h3'
import { generateAuthenticationOptionsForUser, verifyAuthenticationForUser } from '~/server/services/webauthn'
import { createSession } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log("Login get options", body)
    try {
        if (!body.asseResp) {
            // Generate options
            const { email } = body
            console.log("Attempting login for:", { email })
            if (!email) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email is required'
                })
            }
            console.log('Generating options for email:', email)
            const options = await generateAuthenticationOptionsForUser(email)
            if (!options) {
                // User not found or other issue
                throw createError({
                    statusCode: 404,
                    statusMessage: 'User not found or unable to generate authentication options'
                })
            }
            console.log("Generated options:", options)
            return options
        } else {
            // Verify authentication
            const { email, asseResp } = body
            if (!email || !asseResp) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Email and authentication response are required'
                })
            }
            console.log('Verifying authentication for email:', email)
            console.log('Authentication response:', asseResp)
            const verification = await verifyAuthenticationForUser(email, asseResp)
            console.log('Verification result:', verification)
            if (verification.verified) {
                const sessionId = await createSession(email)
                return { verified: true, sessionId }
            }
            return { verified: false }
        }
    } catch (error) {
        console.error('Error in login handler:', error)
        if (error instanceof H3Error) {
            throw error
        } else {
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                stack: error instanceof Error ? error.stack : undefined
            })
        }
    }
})