<template>
  <AppHeader />
  <main>
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { useWs } from './stores/ws'

useWs().setConnection()
</script>
