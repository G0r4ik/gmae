<template>
  <div class="container">
    Ваша комната: {{ idRoom }}
    <br />
    <span>Или введите комнату вашего друга</span>
    <div class="room-input-wrapper">
      <input
        v-model="idRoomFriend"
        type="text"
        class="form-control room__input-code"
        placeholder="code..."
        aria-label="code..."
        aria-describedby="button-addon2" />
      <button class="" type="button" id="button-addon2" @click="joinRoom">
        Вступить
      </button>
    </div>
    <br />
    Список участников:
    <ul>
      <li v-for="user of usersInRooms">
        {{ user }}
      </li>
    </ul>
    <button @click="startGame">Начать игру</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useWs } from '../ws'
import { useUser } from '../store'

let idRoomFriend = ''
let idRoom = ref(String(Math.random()).slice(2, 5))
const currentUser = useUser().user
let usersInRooms = reactive(new Set())
usersInRooms.add(currentUser)

useWs().setConnection()

useWs().sendMessage({
  meta: 'joinToLobby',
  event: 'message',
  user: currentUser,
  message: `${currentUser} присоеденились в лобби ${idRoomFriend}`,
  room: idRoomFriend,
})

function joinRoom() {
  idRoom.value = idRoomFriend
  useWs().sendMessage({
    meta: 'join',
    event: 'message',
    user: currentUser,
    message: `${currentUser} присоеденились в лобби ${idRoomFriend}`,
    room: idRoomFriend,
  })
}

function startGame() {
  useWs().sendMessage({
    event: 'message',
    meta: 'startGame',
    message: 'Ваша игра началась',
    room: idRoom.value,
  })
}

defineExpose({
  usersInRooms,
})
</script>

<style>
.room-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
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
  width: 150px;
}
</style>
