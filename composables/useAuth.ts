
export function useAuth() {
    const sessionToken = ref(localStorage.getItem('sessionToken'))

    const isAuthenticated = computed(() => !!sessionToken.value)

    function setSessionToken(token: string) {
        sessionToken.value = token
        localStorage.setItem('sessionToken', token)
    }

    function clearSessionToken() {
        sessionToken.value = null
        localStorage.removeItem('sessionToken')
    }

    return {
        isAuthenticated,
        setSessionToken,
        clearSessionToken
    }
}