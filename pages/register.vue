<template>
  <form @submit.prevent="handleRegister">
    <input v-model="email" type="email" required placeholder="Enter your email">
    <button type="submit">Register</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const router = useRouter()

async function handleRegister() {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    if (response.ok) {
      router.push({ name: 'verify-email', params: { email: email.value } })
    } else {
      const error = await response.json()
      alert(error.message || 'Registration failed')
    }
  } catch (error) {
    console.error('Registration error:', error)
    alert('An error occurred during registration')
  }
}
</script>