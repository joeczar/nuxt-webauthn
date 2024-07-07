<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" required placeholder="Email">
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { startAuthentication } from '@simplewebauthn/browser'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const email = ref('')
const { login } = useAuth()
const router = useRouter()

async function handleLogin() {
  try {
    // Step 1: Get authentication options from server
    const optionsResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    const options = await optionsResponse.json()

    // Step 2: Start authentication process in the browser
    const asseResp = await startAuthentication(options)

    // Step 3: Verify the authentication with the server
    const verificationResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, asseResp })
    })
    const verificationResult = await verificationResponse.json()

    if (verificationResult.verified) {
      await login(verificationResult.sessionId)
      alert('Login successful!')
      router.push('/dashboard')
    } else {
      alert('Login failed. Please try again.')
    }
  } catch (error) {
    console.error('Login error:', error)
    alert('An error occurred during login. Please try again.')
  }
}
</script>