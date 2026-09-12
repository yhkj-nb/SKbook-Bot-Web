<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/store/theme'

const { initTheme } = useThemeStore()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <router-view />
</template>