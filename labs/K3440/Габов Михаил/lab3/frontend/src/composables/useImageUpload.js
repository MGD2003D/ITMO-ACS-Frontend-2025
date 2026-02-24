import { ref } from 'vue'

export function useImageUpload() {
  const imageDataUrl = ref(null)
  const isDragOver = ref(false)

  function processImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Not an image file'))
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 800
          let width = img.width
          let height = img.height
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
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
    if (!file || !file.type.startsWith('image/')) return
    try {
      imageDataUrl.value = await processImage(file)
    } catch (e) {
      console.error('Image processing failed:', e)
    }
  }

  async function handlePaste(event) {
    const items = event.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        await handleFile(item.getAsFile())
        return
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault()
    isDragOver.value = true
  }

  function handleDragLeave() {
    isDragOver.value = false
  }

  async function handleDrop(event) {
    event.preventDefault()
    isDragOver.value = false
    const file = event.dataTransfer.files[0]
    if (file) await handleFile(file)
  }

  function clearImage() {
    imageDataUrl.value = null
  }

  return { imageDataUrl, isDragOver, handleFile, handlePaste, handleDragOver, handleDragLeave, handleDrop, clearImage }
}
