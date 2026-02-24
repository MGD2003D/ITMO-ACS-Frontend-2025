import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
  { path: '/register', component: () => import('../views/RegisterView.vue'), meta: { guestOnly: true } },
  { path: '/recipes', component: () => import('../views/RecipesView.vue') },
  { path: '/recipes/create', component: () => import('../views/RecipeCreateView.vue'), meta: { requiresAuth: true } },
  { path: '/recipes/:id', component: () => import('../views/RecipeDetailView.vue') },
  { path: '/recipes/:id/edit', component: () => import('../views/RecipeEditView.vue'), meta: { requiresAuth: true } },
  { path: '/my-recipes', component: () => import('../views/MyRecipesView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return '/'
  }
})

export default router
