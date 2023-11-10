import { createRouter, createWebHistory } from 'vue-router'

import GameField from './components/GameField.vue'
import AboutGame from './components/AboutGame.vue'
import AppStart from './components/AppStart.vue'
import AppRooms from './components/AppRooms.vue'

const routes = [
  { path: '/', component: AppStart },
  { path: '/rooms', component: AppRooms },
  { path: '/game', component: GameField },
  { path: '/about', component: AboutGame },
]

export const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(guard => {
  if (guard.matched.length === 0) {
    router.push('/')
  }
})
