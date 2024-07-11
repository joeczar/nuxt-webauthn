<template>
  <div>
    <h1>Verify Your Email</h1>
    <form @submit.prevent="handleSubmit">
      <input
        v-model="verificationCode"
        type="text"
        required
        placeholder="Enter verification code"
      />
      <button type="submit" :disabled="isLoading">Verify Email</button>
    </form>
    <p v-if="error">{{ error.message }}</p>
    <div v-if="isVerified">
      <p>{{ successMessage }}</p>
      <button @click="proceedToWebAuthnRegistration">Proceed to WebAuthn Registration</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEmailVerification } from '@/composables/auth/useVerifyEmail'
import { useRoute } from '#app'

const route = useRoute()
const email = route.query.email as string
const successMessage = ref('')
const isVerified = ref(false)

const { verificationCode, isLoading, error, verifyEmail } = useEmailVerification()

async function handleSubmit() {
  try {
    successMessage.value = await verifyEmail(email)
    isVerified.value = true
  } catch (error) {
    // Error is already handled in the composable
  }
}

function proceedToWebAuthnRegistration() {
  navigateTo(`/register/webauthn?email=${encodeURIComponent(email)}`)
}

// Watcher to handle successful verification
watch(isVerified, (newValue) => {
  if (newValue) {
    // You can perform any actions needed upon successful verification here
    console.info('Email verified successfully')
    navigateTo(`/register/webauthn?email=${encodeURIComponent(email)}`)
    // If you want to automatically navigate after a delay, you could do:
    // setTimeout(() => {
    //   navigateTo(`/register/webauthn?email=${encodeURIComponent(email)}`)
    // }, 3000)
  }
})
</script>
