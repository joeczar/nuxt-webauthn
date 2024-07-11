<template>
  <div>
    <h1>Register WebAuthn</h1>
    <button :disabled="isLoading" @click="handleRegister">Register WebAuthn</button>
    <p v-if="error">{{ error.message }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useWebAuthnRegistration} from '@/composables/auth/useWebauthnRegistration'
import {useRoute} from '#app'

const route = useRoute()

const email = route.query.email as string
const successMessage = ref('')

const { isLoading, error, registerWebAuthn } = useWebAuthnRegistration()

async function handleRegister() {
  try {
    successMessage.value = await registerWebAuthn(email)
    // Navigate to login page after successful registration
    setTimeout(() => {
      navigateTo(`/login?email=${encodeURIComponent(email)}`)
    }, 2000)
  } catch (error) {
    // Error is already handled in the composable
  }
}
</script>