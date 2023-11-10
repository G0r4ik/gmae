import { defineStore } from 'pinia'

export type User = {
  userName: string
  id: string
}

export const useUser = defineStore('user', {
  state: () => ({
    user:
      JSON.parse(localStorage.getItem('user')!) ||
      ({ userName: '', id: '' } as User),
    usersInGame: [] as User[],
    room: '',
    leadOfRoom: {} as User,
    sizeOfMap: 3,
  }),
  actions: {
    updateWebsocketId(websocketId: string) {
      this.user.websocketId = websocketId
    },
    setUser(id: string, name: string, websocketId: string) {
      this.user.id = id
      this.user.userName = name
      this.user.websocketId = websocketId

      localStorage.setItem('user', JSON.stringify(this.user))
    },
  },
})
