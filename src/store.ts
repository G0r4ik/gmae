import { defineStore } from 'pinia'
import { createAnimalName } from './generateName'

export const useUser = defineStore('user', {
  state: () => ({ user: createAnimalName() }),
  actions: {
    increment() {
      // this.count++
    },
  },
})
