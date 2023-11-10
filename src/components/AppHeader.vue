<template>
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <button
          v-if="$route.fullPath !== '/'"
          class="header__go-to-main"
          @click="$router.push('/')">
          Главная
        </button>
        <div class="header__user">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="header__user-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="header__username"> {{ user.userName }}</span>
        </div>
        <div class="header__count">
          {{ countOfUser }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="header_count-svg">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span class="header_count-span">чел. онлайн</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '../stores/store.ts'
import { useWs } from '../stores/ws'

const { user } = useUser()
const countOfUser = ref(0)

useWs().connection.addEventListener('message', event => {
  const data = JSON.parse(event.data)
  if (data.type === 'usersCountChange') countOfUser.value = data.countOfUser
})
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
  border-bottom: 2px solid lightgreen;
  z-index: 5;
}

.header__go-to-main {
  padding: 2px 5px;
}
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header__username {
  font-weight: 600;
}
.header__user {
  display: flex;
  align-items: center;
}
.header__user-icon {
  width: 30px;
  height: 30px;
  fill: white;
}
.header_count-svg {
  display: none;
}

.header__count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
}
.header_count-span {
  font-size: 16px;
}

@media (max-width: 768px) {
  .header_count-svg {
    display: inline;
  }
  .header_count-span {
    display: none;
  }
}
</style>
../utils/ws.ts
