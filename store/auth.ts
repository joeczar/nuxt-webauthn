import { defineStore } from 'pinia'
import { useAuth } from '@/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const { user, isAuthenticated, checkAuth, login, logout } = useAuth()

  function setUser(newUser: any) {
    user.value = newUser
  }

  return {
    user,
    isAuthenticated,
    checkAuth,
    login,
    logout,
    setUser,
  }
})
