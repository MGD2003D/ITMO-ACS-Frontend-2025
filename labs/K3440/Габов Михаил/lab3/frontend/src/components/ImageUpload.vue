<template>
  <div>
    <div
      v-if="!modelValue"
      class="image-dropzone"
      :class="{ dragover: isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <i class="bi bi-image"></i>
      Drop image here or
      <a href="#" class="image-browse-link" @click.prevent="fileInput.click()">browse</a>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />
    <div v-if="modelValue" class="image-preview">
      <img :src="modelValue" alt="Preview" />
      <button type="button" class="image-remove-btn" @click="$emit('update:modelValue', null)">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragOver = ref(false)

function processImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('Not an image')); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function handleFile(file) {
  if (!file?.type.startsWith('image/')) return
  try {
    const dataUrl = await processImage(file)
    emit('update:modelValue', dataUrl)
  } catch (e) {
    console.error('Image error:', e)
  }
}

function onFileChange(e) {
  if (e.target.files[0]) handleFile(e.target.files[0])
}

function onDrop(e) {
  isDragOver.value = false
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
}

// Expose for parent to call on paste event
defineExpose({ handleFile })
</script>
