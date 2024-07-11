// File: server/api/auth/register-webauthn.post.ts

import { defineEventHandler, readBody, createError } from 'h3'
import {
  generateRegistrationOptionsForUser,
  verifyRegistrationForUser,
} from '~/server/services/webauthn'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body.registration) {
    // This is the second step, where we verify the registration
    const { email, registration } = body
    try {
      const verification = await verifyRegistrationForUser(email, registration)
      if (verification.verified) {
        return { success: true, message: 'WebAuthn credential registered successfully' }
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'WebAuthn registration failed verification',
        })
      }
    } catch (error) {
      console.error('Error in WebAuthn registration verification:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error during WebAuthn registration',
      })
    }
  } else {
    // This is the first step, where we generate registration options
    const { email } = body
    try {
      const options = await generateRegistrationOptionsForUser(email)
      return options
    } catch (error) {
      console.error('Error generating WebAuthn registration options:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate WebAuthn registration options',
      })
    }
  }
})
