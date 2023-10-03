<template>
  <div class="start">
    <div class="text-center start__inner">
      <button class="btn btn-primary">Играть с компьютером</button>
      <button class="btn btn-primary" @click="router.push('/rooms')">
        Играть с другом
      </button>
    </div>
    <button class="btn btn-primary" @click="router.push('/about')">
      Об игре
    </button>
  </div>
</template>

<script setup lang="ts">
import { router } from '../routes'
</script>
<style>
.start {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}
.start__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}
</style>
