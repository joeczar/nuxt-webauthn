<template>
  <div>
    <h1>Login with WebAuthn</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" required placeholder="Enter your email" />
      <button type="submit" :disabled="isLoading">Login</button>
    </form>
    <p v-if="error">{{ error.message }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWebAuthnAuthentication } from '@/composables/auth/useWebauthnAuthentication'

const email = ref('')
const successMessage = ref('')

const { isLoading, error, authenticate } = useWebAuthnAuthentication()

async function handleLogin() {
  try {
    const sessionId = await authenticate(email.value)
    successMessage.value = 'Login successful!'
    // Here you might want to store the sessionId in your app's state management
    // For example, if using Pinia:
    // useAuthStore().setSessionId(sessionId)

    // Navigate to a protected page after successful login
    setTimeout(() => {
      navigateTo('/protected')
    }, 2000)
  } catch (error) {
    // Error is already handled in the composable
  }
}
</script>