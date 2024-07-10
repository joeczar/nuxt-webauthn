import { ref } from 'vue'
import { startAuthentication } from '@simplewebauthn/browser'
import type { PublicKeyCredentialRequestOptionsJSON, AuthenticationResponseJSON } from '@simplewebauthn/types'

export function useWebAuthnAuthentication() {
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    async function authenticate(email: string) {
        isLoading.value = true
        error.value = null
        try {
            console.log({email})
            // Step 1: Get authentication options
            const options = await $fetch<PublicKeyCredentialRequestOptionsJSON>('/api/auth/login', {
                method: 'POST',
                body: { email }
            })
            console.log({options})
            // Step 2: Start authentication
            const authenticationResponse = await startAuthentication(options)

            // Step 3: Verify authentication
            const verificationResponse = await $fetch<{ verified: boolean; sessionId?: string }>('/api/auth/login', {
                method: 'POST',
                body: { email, asseResp: authenticationResponse }
            })

            if (verificationResponse.verified) {
                return verificationResponse.sessionId
            } else {
                throw new Error('Authentication failed')
            }
        } catch (e) {
            error.value = e instanceof Error ? e : new Error('Failed to authenticate')
            throw error.value
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        authenticate
    }
}