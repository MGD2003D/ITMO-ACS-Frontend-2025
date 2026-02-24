<template>
  <div class="container py-4">
    <div class="profile-container">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="profile-header mb-4">
          <div class="profile-avatar">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" />
            <i v-else class="bi bi-person-fill"></i>
          </div>
          <div>
            <h3>{{ form.username }}</h3>
            <p class="text-muted mb-0">{{ form.email }}</p>
            <small class="text-muted">Joined {{ formatDate(joinedAt) }}</small>
          </div>
        </div>

        <div v-if="alertMsg" :class="`alert alert-${alertType}`">{{ alertMsg }}</div>

        <!-- Profile form -->
        <div class="profile-card mb-4">
          <h4><i class="bi bi-person me-2"></i>Profile Info</h4>
          <form @submit.prevent="saveProfile">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input v-model="form.username" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Bio</label>
              <textarea v-model="form.bio" class="form-control" rows="3" placeholder="Tell us about yourself..."></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Avatar URL</label>
              <input v-model="form.avatarUrl" type="url" class="form-control" placeholder="https://..." />
            </div>
            <button type="submit" class="btn btn-success" :disabled="savingProfile">
              {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Change password -->
        <div class="profile-card">
          <h4><i class="bi bi-lock me-2"></i>Change Password</h4>
          <form @submit.prevent="changePassword">
            <div class="mb-3">
              <label class="form-label">Current Password</label>
              <input v-model="pwForm.current" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">New Password</label>
              <input v-model="pwForm.newPw" type="password" class="form-control" minlength="6" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Confirm New Password</label>
              <input v-model="pwForm.confirm" type="password" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-outline-primary" :disabled="savingPw">
              {{ savingPw ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/auth'

const store = useAuthStore()

const loading = ref(true)
const alertMsg = ref('')
const alertType = ref('success')
const savingProfile = ref(false)
const savingPw = ref(false)
const joinedAt = ref(null)

const form = ref({ username: '', email: '', bio: '', avatarUrl: '' })
const pwForm = ref({ current: '', newPw: '', confirm: '' })

function showAlert(type, msg) {
  alertType.value = type
  alertMsg.value = msg
  setTimeout(() => { alertMsg.value = '' }, 4000)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function saveProfile() {
  savingProfile.value = true
  try {
    await authApi.updateUser(store.currentUser.id, {
      username: form.value.username,
      email: form.value.email,
      bio: form.value.bio,
      avatarUrl: form.value.avatarUrl,
    })
    showAlert('success', 'Profile updated!')
  } catch (e) {
    showAlert('danger', e.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  if (pwForm.value.newPw !== pwForm.value.confirm) {
    showAlert('danger', 'New passwords do not match')
    return
  }
  savingPw.value = true
  try {
    await authApi.updateUser(store.currentUser.id, {
      currentPassword: pwForm.value.current,
      newPassword: pwForm.value.newPw,
    })
    showAlert('success', 'Password updated!')
    pwForm.value = { current: '', newPw: '', confirm: '' }
  } catch (e) {
    showAlert('danger', e.message || 'Failed to update password')
  } finally {
    savingPw.value = false
  }
}

onMounted(async () => {
  try {
    const user = await authApi.getUserById(store.currentUser.id)
    form.value = {
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    }
    joinedAt.value = user.createdAt
  } catch (e) {
    showAlert('danger', 'Failed to load profile')
  } finally {
    loading.value = false
  }
})
</script>
