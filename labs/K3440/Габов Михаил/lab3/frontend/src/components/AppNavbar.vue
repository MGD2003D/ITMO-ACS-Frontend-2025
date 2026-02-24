<template>
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">Recipeo</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" exact-active-class="active">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/recipes" active-class="active">Recipes</RouterLink>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <RouterLink class="nav-link" to="/my-recipes" active-class="active">My Recipes</RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li v-if="!isAuthenticated" class="nav-item">
            <RouterLink class="nav-link" to="/login" active-class="active">Login</RouterLink>
          </li>
          <li v-if="!isAuthenticated" class="nav-item">
            <RouterLink class="nav-link" to="/register" active-class="active">Register</RouterLink>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <RouterLink class="nav-link" to="/profile" active-class="active">
              <i class="bi bi-person-circle me-1"></i>{{ currentUser?.username }}
            </RouterLink>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <button class="nav-link btn btn-link" @click="logout">
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </li>
          <li class="nav-item d-flex align-items-center">
            <button
              class="theme-toggle-btn"
              @click="toggleTheme"
              :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <i :class="theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useAuth } from '../composables/useAuth'
import { useTheme } from '../composables/useTheme'

const store = useAuthStore()
const { logout } = useAuth()
const { theme, toggleTheme } = useTheme()
const isAuthenticated = computed(() => store.isAuthenticated)
const currentUser = computed(() => store.currentUser)
</script>
