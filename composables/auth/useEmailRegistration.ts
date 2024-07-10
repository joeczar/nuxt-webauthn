import { ref } from 'vue'

export function useEmailRegistration() {
    const email = ref('')
    const isLoading = ref(false)
    const error = ref<Error | null>(null)

    async function registerEmail() {
        isLoading.value = true
        error.value = null
        try {
            const response = await $fetch<{ message: string }>('/api/auth/register', {
                method: 'POST',
                body: { email: email.value }
            })
            return response.message
        } catch (e) {
            error.value = e instanceof Error ? e : new Error('Failed to register email')
            throw error.value
        } finally {
            isLoading.value = false
        }
    }

    return {
        email,
        isLoading,
        error,
        registerEmail
    }
}