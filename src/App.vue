<template>
  <AppHeader />
  <main>
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<style scoped>
main {
  margin-top: 50px;
}
</style>
