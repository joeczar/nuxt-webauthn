<template>
  <form @submit.prevent="verifyEmail">
    <input v-model="code" type="text" required placeholder="Enter verification code">
    <button type="submit">Verify Email</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { startRegistration } from '@simplewebauthn/browser'

const code = ref('')
const route = useRoute()
const router = useRouter()
const email = route.params.email as string

async function verifyEmail() {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: code.value })
    })

    if (response.ok) {
      // Email verified, now start WebAuthn registration
      await startWebAuthnRegistration()
    } else {
      const error = await response.json()
      alert(error.message || 'Verification failed')
    }
  } catch (error) {
    console.error('Verification error:', error)
    alert('An error occurred during verification')
  }
}

async function startWebAuthnRegistration() {
  try {
    // Get registration options from server
    const optionsRes = await fetch('/api/auth/webauthn/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const options = await optionsRes.json()

    // Start registration process in the browser
    const attResp = await startRegistration(options)

    // Send the response back to the server for verification
    const verificationRes = await fetch('/api/auth/webauthn/register-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, attResp })
    })

    if (verificationRes.ok) {
      // Registration successful, log the user in
      const { sessionId } = await verificationRes.json()
      localStorage.setItem('sessionId', sessionId)
      router.push('/dashboard')
    } else {
      throw new Error('WebAuthn registration failed')
    }
  } catch (error) {
    console.error('WebAuthn registration error:', error)
    alert('An error occurred during WebAuthn registration')
  }
}
</script>