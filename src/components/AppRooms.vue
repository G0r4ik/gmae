<template>
  <div class="rooms">
    <div class="container">
      <div class="rooms__inner">
        <div class="rooms__admin">
          Создатель лобби:
          <b>{{ useUser().leadOfRoom.userName }}</b>
        </div>
        <div class="rooms__id-room">
          ID комнаты: <b>{{ useUser().room }}</b>
          <svg
            v-if="!isCopyId"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="rooms__copy-id"
            @click="copyIdRoom">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <small v-if="errors.canNotCopy">{{ errors.canNotCopy }}</small>
          <div v-else-if="isCopyId" class="room__copy-okey">
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
              class="rooms__copy-id_check">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="rooms__copy-id_check-text">скопировано</span>
          </div>
        </div>
        <hr />
        <div>Или введите ID комнаты вашего друга</div>
        <div class="room-input-wrapper mt-1">
          <input
            v-model="idRoomFriend"
            type="text"
            class="form-control form-control-sm room__input-code"
            placeholder="CODE"
            aria-label="CODE"
            aria-describedby="button-addon2" />
          <button id="button-addon2" class="" type="button" @click="joinRoom">
            Вступить
          </button>
          <small v-if="errors.notFoundRoom" class="error mx-2">
            {{ errors.notFoundRoom }}
          </small>
        </div>
        <hr />
        Список участников:
        <ul>
          <li v-for="user of usersInRooms" :key="user.id">
            {{ user.userName }}
          </li>
        </ul>

        <hr />
        <div class="rooms__size-of-map">
          <label for="sizeOfMap">
            Размер поля:
            <select
              id="sizeOfMap"
              name="sizeOfMap"
              :value="useUser().sizeOfMap"
              @change="changeSizeOfMap">
              <option v-for="i of sizes" :key="i" :value="i">{{ i }}</option>
            </select>
          </label>
        </div>
        <button @click="startGame">Начать игру</button>
        <small v-if="errors.insufficientUsers" class="error error-block">
          {{ errors.insufficientUsers }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWs } from '../stores/ws'
import { useUser, User } from '../stores/store.ts'

const router = useRouter()
const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10]
useUser().room = String(Math.random()).slice(2, 5)
useUser().leadOfRoom = useUser().user

const idRoomFriend = ref('')
const currentUser = useUser().user
const usersInRooms: Set<User> = reactive(new Set())
const isCopyId = ref(false)
const errors = reactive({
  notFoundRoom: '',
  insufficientUsers: '',
  canNotCopy: '',
})

if (useUser().user.id) {
  useWs().sendMessage({
    meta: 'updateWebsocketId',
    event: 'message',
  })
} else {
  console.log(useUser().user)

  useWs().sendMessage({
    meta: 'createUser',
    event: 'message',
  })
}

useWs().sendMessage({
  meta: 'createRoom',
  event: 'message',
  user: currentUser,
})

useWs().connection.addEventListener('message', (event: { data: string }) => {
  const message = JSON.parse(event.data)
  if (message.type === 'createRoom') {
    useUser().room = message.room
    usersInRooms.add(currentUser)
  }

  if (message.type === 'createUser') {
    useUser().setUser(message.id, message.userName, message.websocketId)
  }
  if (message.meta === 'updateWebsocketId') {
    useUser().updateWebsocketId(message.websocketId)
  }

  if (message.type === 'leaveRoom') {
    console.log('bimbam')

    usersInRooms.delete(message.user)
  }

  if (
    message.type === 'joinToRoom' &&
    !message.error &&
    message.room === useUser().room
  ) {
    console.log('К вам зашли')
    usersInRooms.clear()
    for (const user of message.user) usersInRooms.add(user)

    useWs().sendMessage({
      meta: 'changeSize',
      event: 'message',
      user: currentUser,
      size: useUser().sizeOfMap,
      room: useUser().room,
    })
  }

  if (
    message.type === 'joinToRoom' &&
    !message.error &&
    message.room !== useUser().room
  ) {
    console.log('Вы зашли')
    useWs().sendMessage({
      meta: 'leave',
      event: 'message',
      user: currentUser,
      room: useUser().room,
    })

    useUser().room = idRoomFriend.value
    usersInRooms.clear()
    for (const user of message.user) usersInRooms.add(user)
    const temporaryArray = [...usersInRooms]
    useUser().leadOfRoom =
      temporaryArray[0].id === useUser().user.id
        ? temporaryArray[1]
        : temporaryArray[0]
  }

  if (message.type === 'joinToRoom' && message.error) {
    errors.notFoundRoom = 'Такого лобби нет'
  }

  if (message.type === 'changeSize') {
    console.log('size')

    useUser().sizeOfMap = message.size
  }

  if (message.type === 'startGame') {
    router.push('/game')
    useUser().usersInGame = [...usersInRooms].sort()
    console.log('Игра началась!')
  }
})

function joinRoom() {
  if (useUser().room === idRoomFriend.value) return

  errors.notFoundRoom = ''
  console.log(currentUser)

  useWs().sendMessage({
    meta: 'join',
    event: 'message',
    user: currentUser,
    room: idRoomFriend.value,
  })
}

async function copyIdRoom() {
  await navigator.clipboard.writeText(useUser().room)
  try {
    isCopyId.value = true
    setTimeout(() => (isCopyId.value = false), 3000)
  } catch {
    errors.canNotCopy = 'Failure to copy. Check permissions for clipboard'
  }
}

function startGame() {
  if (usersInRooms.size < 2) {
    errors.insufficientUsers = 'Вы не можете играть один в сетевой матч'
  } else {
    useWs().sendMessage({
      event: 'message',
      meta: 'startGame',
      room: useUser().room,
    })
  }
}

function changeSizeOfMap(event: Event) {
  const size = event.target as HTMLInputElement
  useUser().sizeOfMap = +size.value
  useWs().sendMessage({
    meta: 'changeSize',
    event: 'message',
    user: currentUser,
    size: useUser().sizeOfMap,
    room: useUser().room,
  })
}
</script>

<style>
.room-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.rooms__admin b {
  white-space: nowrap;
}
.rooms__copy-id {
  cursor: pointer;
  margin-left: 10px;
}
.rooms__id-room {
  display: flex;
  align-items: center;
}
.room__copy-okey {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
}
.room-input-wrapper button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.room-input-wrapper input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.room__input-code {
  width: 100px;
  text-align: center;
}
.error {
  color: tomato;
}
.error-block {
  display: block;
  margin: 5px 0;
}

.rooms__size-of-map {
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .rooms__copy-id_check-text {
    display: none;
  }
}
</style>
../utils/ws
