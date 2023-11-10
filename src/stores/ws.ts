import { defineStore } from 'pinia'
import { User } from './store.ts'

type message = {
  type?: string
  user?: User
  room?: string
  meta?: string
  size?: number
  event?: string
  cordinates?: string
}

export const useWs = defineStore('ws', {
  state: () => ({
    connection: {} as WebSocket,
  }),
  actions: {
    setConnection() {
      this.connection = new WebSocket('ws://localhost:5001')

      this.connection.addEventListener('open', event => {
        console.log('Соединение установлено', event)
      })

      this.connection.addEventListener('message', event => {
        console.log(JSON.parse(event.data))
      })
    },

    sendMessage(object: message) {
      this.waitForSocketConnection(this.connection, () => {
        console.log('message send')
        this.connection.send(JSON.stringify(object))
      })
    },

    waitForSocketConnection(socket: WebSocket, callback: () => void) {
      setTimeout(() => {
        if (socket.readyState === 1 && callback != null) {
          callback()
        } else {
          console.log('wait for connection...')
          this.waitForSocketConnection(socket, callback)
        }
      }, 50)
    },
  },
})
