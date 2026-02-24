<template>
  <div id="app-wrapper">
    <AppNavbar />
    <main>
      <RouterView />
    </main>
    <footer class="py-4 text-center text-white">
      <div class="container">
        <p class="mb-0">Recipeo</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>
