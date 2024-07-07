import { defineEventHandler, readBody } from 'h3'
import { generateAuthenticationOptionsForUser, verifyAuthenticationForUser } from '~/server/services/webauthn'
import { createSession } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.asseResp) {
        // Step 1: Generate authentication options
        const { email } = body
        const options = await generateAuthenticationOptionsForUser(email)
        return options
    } else {
        // Step 2: Verify authentication
        const { email, asseResp } = body
        const verification = await verifyAuthenticationForUser(email, asseResp)
        if (verification.verified) {
            const sessionId = await createSession(email)
            return { verified: true, sessionId }
        }
        return { verified: false }
    }
})