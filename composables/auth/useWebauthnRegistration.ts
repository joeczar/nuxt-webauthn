import { ref } from 'vue'
import { startRegistration } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types'

export function useWebAuthnRegistration() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function registerWebAuthn(email: string) {
    isLoading.value = true
    error.value = null
    try {
      // Step 1: Get registration options
      const options = await $fetch<PublicKeyCredentialCreationOptionsJSON>(
        '/api/auth/register-webauthn',
        {
          method: 'POST',
          body: { email },
        }
      )

      // Step 2: Start registration
      const registrationResponse = await startRegistration(options)

      // Step 3: Verify registration
      const verificationResponse = await $fetch<{ success: boolean; message: string }>(
        '/api/auth/register-webauthn',
        {
          method: 'POST',
          body: { email, registration: registrationResponse },
        }
      )

      return verificationResponse.message
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to register WebAuthn')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    registerWebAuthn,
  }
}
