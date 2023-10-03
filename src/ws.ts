import { defineStore } from 'pinia'

export const useWs = defineStore('ws', {
  state: () => ({ connection: null, isConnect: false }),
  actions: {
    setConnection() {
      console.log('set')
      this.connection = new WebSocket('ws://localhost:5000')

      this.connection.onopen = function (event) {
        console.log('Соединение установлено', event)
        this.isConnect = true
      }
    },

    sendMessage(obj: any) {
      console.log('send1')
      if (this.isConnect) {
        console.log('send2')
        console.log(obj)
        this.connection.send(JSON.stringify(obj))
        console.log('send3')
      }
    },
  },
})

// connection.onmessage = function (event) {
//   const message = JSON.parse(event.data)
//   console.log(message)
//   if (message.type === 'joinToLobby' && message.room === idRoom.value) {
//     for (const user of message.user) {
//       usersInRooms.add(user)
//     }
//   }
//   if (message.type === 'createLobby') {
//     usersInRooms.add(message.user)
//   }
//   if (message.type === 'startGame') {
//     isStartGame.value = true
//   }
//   if (message.meta === 'move') {
//     const [x, y] = message.cordinates.split('-')
//     console.log(x, y)

//     if (currentUser !== message.user) {
//       GameFieldRef.value.funcHod(+x, +y, false)
//     }
//   }
// }
