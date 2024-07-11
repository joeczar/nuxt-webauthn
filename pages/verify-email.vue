<template>
  <div>
    <h1>Verify Your Email</h1>
    <p>We've sent a verification code to {{ email }}. Please enter it below.</p>
    <form @submit.prevent="verifyEmail">
      <input v-model="code" type="text" required placeholder="Enter verification code" />
      <button type="submit">Verify Email</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const code = ref('')
const route = useRoute()
const router = useRouter()
const email = route.params.email as string

async function verifyEmail() {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: code.value }),
    })

    if (response.ok) {
      router.push({ name: 'webauthn-register', params: { email } })
    } else {
      const error = await response.json()
      alert(error.message || 'Verification failed')
    }
  } catch (error) {
    console.error('Verification error:', error)
    alert('An error occurred during verification')
  }
}
</script>
