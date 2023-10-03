import GameField from './components/GameField.vue'
import AboutGame from './components/AboutGame.vue'
import AppStart from './components/AppStart.vue'
import AppRooms from './components/AppRooms.vue'

const routes = [
  { path: '/', component: AppStart },
  { path: '/about', component: AboutGame },

  { path: '/game', component: GameField },
  { path: '/rooms', component: AppRooms },
]

import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
