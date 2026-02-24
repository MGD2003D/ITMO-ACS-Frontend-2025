<template>
  <div>
    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else>
      <div v-if="comments.length === 0" class="text-muted">No comments yet. Be the first to comment!</div>
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="d-flex justify-content-between">
          <div>
            <span class="comment-author">{{ comment.username || 'Anonymous' }}</span>
            <span class="comment-date ms-2">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <button
            v-if="currentUserId == comment.user?.id"
            class="btn btn-sm btn-outline-danger"
            @click="handleDelete(comment.id)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <p class="mb-0 mt-2">{{ comment.content }}</p>
      </div>
    </div>

    <form v-if="isAuthenticated" class="mt-3" @submit.prevent="handleSubmit">
      <div class="mb-2">
        <textarea
          v-model="newComment"
          class="form-control"
          rows="2"
          placeholder="Write a comment..."
          required
        ></textarea>
      </div>
      <button type="submit" class="btn btn-success btn-sm" :disabled="submitting">
        {{ submitting ? 'Posting...' : 'Post Comment' }}
      </button>
    </form>
    <p v-else class="text-muted mt-2">
      <RouterLink to="/login">Login</RouterLink> to leave a comment.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useInteractions } from '../composables/useInteractions'
import { authApi } from '../api/authApi'

const props = defineProps({
  recipeId: { type: [String, Number], required: true },
})

const emit = defineEmits(['alert'])

const store = useAuthStore()
const { getComments, addComment, deleteComment } = useInteractions()

const isAuthenticated = ref(store.isAuthenticated)
const currentUserId = ref(store.currentUser?.id)
const comments = ref([])
const loading = ref(false)
const newComment = ref('')
const submitting = ref(false)

async function loadComments() {
  loading.value = true
  try {
    const raw = await getComments(props.recipeId)
    // enrich with usernames
    const uniqueIds = [...new Set(raw.map(c => c.user?.id).filter(Boolean))]
    const usersMap = {}
    await Promise.all(uniqueIds.map(async (uid) => {
      try {
        const u = await authApi.getUserById(uid)
        usersMap[uid] = u.username
      } catch {
        usersMap[uid] = `user_${uid}`
      }
    }))
    comments.value = raw.map(c => ({ ...c, username: usersMap[c.user?.id] || 'Anonymous' }))
  } catch (e) {
    emit('alert', { type: 'danger', message: 'Failed to load comments.' })
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    await addComment(props.recipeId, newComment.value.trim())
    newComment.value = ''
    emit('alert', { type: 'success', message: 'Comment added!' })
    await loadComments()
  } catch (e) {
    emit('alert', { type: 'danger', message: 'Failed to add comment.' })
  } finally {
    submitting.value = false
  }
}

async function handleDelete(commentId) {
  try {
    await deleteComment(commentId)
    emit('alert', { type: 'success', message: 'Comment deleted!' })
    await loadComments()
  } catch {
    emit('alert', { type: 'danger', message: 'Failed to delete comment.' })
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(loadComments)
</script>
