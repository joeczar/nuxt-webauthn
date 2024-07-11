import { defineEventHandler, H3Error, readBody, createError } from 'h3'
import {
  generateAuthenticationOptionsForUser,
  verifyAuthenticationForUser,
} from '~/server/services/webauthn'
import { createSession } from '~/server/utils/sessionStore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  try {
    if (!body.asseResp) {
      // Generate options
      const { email } = body

      if (!email) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email is required',
        })
      }

      const options = await generateAuthenticationOptionsForUser(email)
      if (!options) {
        // User not found or other issue
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found or unable to generate authentication options',
        })
      }
      return options
    } else {
      // Verify authentication
      const { email, asseResp } = body
      if (!email || !asseResp) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email and authentication response are required',
        })
      }

      const verification = await verifyAuthenticationForUser(email, asseResp)

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
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }
})
