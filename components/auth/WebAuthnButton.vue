<script setup lang="ts">
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types'

const props = withDefaults(
  defineProps<{
    mode?: 'register' | 'login'
    buttonText?: string
    email?: string
  }>(),
  {
    mode: 'login',
    buttonText: 'Use Passwordless Login',
    email: '',
  }
)

const emit = defineEmits<{
  (e: 'success', sessionId?: string): void
  (e: 'error', error: Error): void
}>()

async function handleWebAuthn() {
  try {
    if (!props.email) throw new Error('Email is required')

    let options: PublicKeyCredentialCreationOptionsJSON | PublicKeyCredentialRequestOptionsJSON
    let credential: RegistrationResponseJSON | AuthenticationResponseJSON
    let verificationResponse: { verified: boolean; sessionId?: string }

    if (props.mode === 'register') {
      options = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email: props.email },
      })

      credential = await startRegistration(options as PublicKeyCredentialCreationOptionsJSON)
      verificationResponse = await $fetch<{ verified: boolean }>('/api/auth/verify-email', {
        method: 'POST',
        body: { email: props.email, response: credential },
      })
    } else {
      options = await $fetch<PublicKeyCredentialRequestOptionsJSON>('/api/auth/login', {
        method: 'POST',
        body: { email: props.email },
      })

      credential = await startAuthentication(options, true)
      verificationResponse = await $fetch<{ verified: boolean; sessionId?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: { email: props.email, asseResp: credential },
        }
      )
    }

    if (verificationResponse.verified) {
      emit('success', verificationResponse.sessionId)
    } else {
      throw new Error('Verification failed')
    }
  } catch (error) {
    console.error('WebAuthn error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    emit('error', error instanceof Error ? error : new Error('An unknown error occurred'))
  }
}
</script>
<template>
  <button @click="handleWebAuthn">{{ buttonText }}</button>
</template>
