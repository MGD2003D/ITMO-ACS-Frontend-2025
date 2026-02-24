<template>
  <div class="card recipe-card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title">{{ recipe.title }}</h5>
        <span class="badge" :class="difficultyClass"><i :class="difficultyIcon" class="me-1"></i>{{ recipe.difficulty || 'N/A' }}</span>
      </div>
      <p class="recipe-description">{{ truncate(recipe.description) }}</p>
      <div class="recipe-meta">
        <span v-if="recipe.user"><i class="bi bi-person"></i>{{ recipe.user.username }}</span>
        <span><i class="bi bi-calendar3"></i>{{ formatDate(recipe.createdAt) }}</span>
      </div>
    </div>
    <div class="card-footer d-flex gap-2 flex-wrap">
      <RouterLink :to="`/recipes/${recipe.id}`" class="btn btn-success btn-sm flex-grow-1">
        <i class="bi bi-eye me-1"></i>View
      </RouterLink>
      <template v-if="showEdit">
        <RouterLink :to="`/recipes/${recipe.id}/edit`" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-pencil"></i>
        </RouterLink>
        <button class="btn btn-outline-danger btn-sm" @click="$emit('delete', recipe.id)">
          <i class="bi bi-trash"></i>
        </button>
      </template>
      <button v-if="showRemoveFavorite" class="btn btn-outline-secondary btn-sm" @click="$emit('remove-favorite', recipe.id)">
        <i class="bi bi-bookmark-x me-1"></i>Remove
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  recipe: { type: Object, required: true },
  showEdit: { type: Boolean, default: false },
  showRemoveFavorite: { type: Boolean, default: false },
})

defineEmits(['delete', 'remove-favorite'])

const difficultyClass = computed(() => {
  switch (props.recipe.difficulty) {
    case 'easy': return 'bg-success'
    case 'medium': return 'bg-warning'
    case 'hard': return 'bg-danger'
    default: return 'bg-secondary'
  }
})

const difficultyIcon = computed(() => {
  switch (props.recipe.difficulty) {
    case 'easy': return 'bi bi-emoji-smile'
    case 'medium': return 'bi bi-emoji-neutral'
    case 'hard': return 'bi bi-emoji-expressionless'
    default: return ''
  }
})

function truncate(text, len = 100) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
