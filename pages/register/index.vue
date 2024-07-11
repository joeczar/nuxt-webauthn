<script setup lang="ts">
import { useEmailRegistration } from '~/composables/auth/useEmailRegistration'

const { email, isLoading, error, registerEmail } = useEmailRegistration()

async function handleSubmit() {
  try {
    const message = await registerEmail()
    console.info('emailRegistration', { message })
    navigateTo(`/register/verify-email?email=${encodeURIComponent(email.value)}`)
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" required />
    <button type="submit" :disabled="isLoading">Register</button>
    <p v-if="error">{{ error.message }}</p>
  </form>
</template>
