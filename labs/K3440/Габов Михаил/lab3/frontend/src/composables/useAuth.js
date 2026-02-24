import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/authApi'
import { useRouter } from 'vue-router'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  async function login(email, password) {
    const data = await authApi.login(email, password)
    store.setToken(data.token)
  }

  async function register(username, email, password) {
    return await authApi.register(username, email, password)
  }

  function logout() {
    store.clearToken()
    router.push('/login')
  }

  return {
    isAuthenticated: store.isAuthenticated,
    currentUser: store.currentUser,
    login,
    register,
    logout,
  }
}
