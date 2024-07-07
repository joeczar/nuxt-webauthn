import { ref, computed } from 'vue'

export function useAuth() {
    const user = ref(null)
    const sessionId = ref(localStorage.getItem('sessionId'))

    const isAuthenticated = computed(() => !!sessionId.value)

    async function checkAuth() {
        if (!sessionId.value) {
            user.value = null
            return
        }

        try {
            const response = await fetch('/api/auth/check', {
                headers: {
                    'Authorization': `Bearer ${sessionId.value}`
                }
            })
            if (response.ok) {
                user.value = await response.json()
            } else {
                user.value = null
                sessionId.value = null
                localStorage.removeItem('sessionId')
            }
        } catch (error) {
            console.error('Error checking authentication:', error)
            user.value = null
            sessionId.value = null
            localStorage.removeItem('sessionId')
        }
    }

    async function login(newSessionId: string) {
        sessionId.value = newSessionId
        localStorage.setItem('sessionId', newSessionId)
        await checkAuth()
    }

    async function logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionId.value}`
                }
            })
        } catch (error) {
            console.error('Error logging out:', error)
        } finally {
            user.value = null
            sessionId.value = null
            localStorage.removeItem('sessionId')
        }
    }

    return {
        user,
        isAuthenticated,
        checkAuth,
        login,
        logout,
    }
}