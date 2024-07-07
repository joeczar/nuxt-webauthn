<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" required placeholder="Email">
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { startRegistration } from '@simplewebauthn/browser'
import type {PublicKeyCredentialCreationOptionsJSON} from "@simplewebauthn/types";

const email = ref('')

async function handleRegister() {
  try {
    // Step 1: Get registration options from server
    const optionsResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    if (!optionsResponse.ok) {
      throw new Error('Failed to register')
    }
    const options: PublicKeyCredentialCreationOptionsJSON = await optionsResponse.json()
    console.log('Registration options:', options)

    // Step 2: Start registration process in the browser
    const attResp = await startRegistration(options)
    console.log('Browser attestation response:', attResp)

    // Step 3: Verify the registration with the server
    const verificationResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, response: attResp })
    })
    const verificationResult = await verificationResponse.json()
    console.log('Verification result:', verificationResult)

    if (verificationResult.verified) {
      alert('Registration successful!')
      // Redirect to login or dashboard
    } else {
      alert('Registration failed. Please try again.')
    }
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      alert(`An error occurred during registration: ${error.message}`)
    } else {
      alert('An unknown error occurred during registration. Please try again.')
    }
  }
}
</script>