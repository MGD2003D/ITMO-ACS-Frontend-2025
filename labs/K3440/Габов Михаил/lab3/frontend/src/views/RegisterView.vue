<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="username" type="text" class="form-control" minlength="3" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>
        <div class="mb-4">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" minlength="6" required />
        </div>
        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="text-center mt-3 text-muted">
        Already have an account? <RouterLink to="/login">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = ''
  if (password.value.length < 6) { error.value = 'Password must be at least 6 characters'; return }
  loading.value = true
  try {
    await register(username.value, email.value, password.value)
    success.value = 'Registration successful! Redirecting to login...'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
