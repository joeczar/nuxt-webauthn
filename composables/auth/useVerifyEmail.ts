import { ref } from 'vue'

export function useEmailVerification() {
  const verificationCode = ref('')
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function verifyEmail(email: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await $fetch<{ message: string }>('/api/auth/verify-email', {
        method: 'POST',
        body: { email, code: verificationCode.value },
      })
      return response.message
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to verify email')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    verificationCode,
    isLoading,
    error,
    verifyEmail,
  }
}
