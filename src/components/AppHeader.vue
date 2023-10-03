<template>
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <!-- <button @click="$router.back()">Назад</button> -->
        <span class="header__username"> {{ user.user }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useUser } from '../store.ts'
const user = useUser()
</script>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid greenyellow;
  z-index: 5;
}
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header__username {
  font-weight: 600;
}
</style>
