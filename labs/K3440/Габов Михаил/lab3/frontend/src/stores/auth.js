import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    throw new Error('Invalid token')
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    try {
      const payload = decodeToken(token.value)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        token.value = null
        localStorage.removeItem('token')
        return false
      }
      return true
    } catch {
      token.value = null
      localStorage.removeItem('token')
      return false
    }
  })

  const currentUser = computed(() => {
    if (!token.value) return null
    try {
      const payload = decodeToken(token.value)
      return { id: payload.userId, username: payload.username }
    } catch {
      return null
    }
  })

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, isAuthenticated, currentUser, setToken, clearToken }
})
