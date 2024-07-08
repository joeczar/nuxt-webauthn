<template>
  <div>
    <h2>Verify Your Email</h2>
    <form @submit.prevent="verifyEmail">
      <input v-model="code" type="text" placeholder="Enter verification code" required>
      <button type="submit">Verify Email</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code = ref('')
const email = ref('') // You might want to pass this as a prop or get it from a store

async function verifyEmail() {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code: code.value })
    })

    if (response.ok) {
      alert('Email verified successfully!')
      // Redirect or update UI as needed
    } else {
      const error = await response.json()
      alert(error.statusMessage || 'Failed to verify email')
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    alert('An error occurred while verifying your email')
  }
}
</script>