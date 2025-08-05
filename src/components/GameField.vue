<template>
  <div v-if="users.length > 0" class="game">
    <div class="game__inner">
      <div class="container">
        <div v-if="!isEndGame" class="game__top">
          <div class="game__score">
            <span class="game__score-item opp0">{{ scores[0] }}</span>
            <span class="game__score-item opp1">{{ scores[1] }}</span>
          </div>
          <div class="game__opponents">
            <span class="game__opponents-item opp0">
              {{ users[0]?.userName }}
              <span v-if="users[0].userName === useUser().user.userName">
                (ВЫ)
              </span>
            </span>
            <span class="game__opponents-item opp1">
              {{ users[1]?.userName }}
              <span v-if="users[1].userName === useUser().user.userName">
                (ВЫ)
              </span>
            </span>
          </div>
          <span class="game__player" :class="`game__player_${currentHod}`">
            Игрок {{ users[currentHod].userName }}
          </span>
          делает ход
        </div>
        <div v-else class="game__results">
          <div>Игра окончена!</div>
          <div>{{ scores[0] }} - {{ scores[1] }}</div>
          <div v-if="winner !== 'DRAW'">
            Победа игрока {{ winner.userName }}
          </div>
          <div v-else>Ничья</div>
          <div v-if="enemyCouldRestart">
            Противник желает продолжить игру
            <button @click="acceptRestart">Согласиться</button>
            <button @click="leaveGameFunction">Выйти</button>
          </div>
          <div v-else-if="enemyLeave">
            Противник вышел из игры
            <button @click="leaveGameFunction">Выйти</button>
          </div>
          <div v-else>
            <button @click="restartGame">Повторить</button>
            <button @click="leaveGameFunction">Выйти</button>
          </div>
        </div>
        <div class="field">
          <div
            v-for="(row, y) of map"
            ref="rows"
            :key="y"
            class="row_"
            :style="{
              minHeight: `${percentOfOneItem * (y % 2 === 1 ? 3 : 1)}%`,
              // minHeight: `${}%`,
            }">
            <div
              v-for="(item, x) of row"
              :key="x"
              :style="item.styles"
              :class="[
                item.cssClass,
                `opp${item.whatIsOpp}`,
                item.isEdge && 'edge',
              ]"
              @click="makeMove(x, y)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWs } from '../stores/ws'
import { useUser } from '../stores/store.ts'
import { Cell, Line, createMap } from '../utils/map'
import { router } from '../routes'

const { sizeOfMap } = useUser()
const allLinesCount = sizeOfMap * (sizeOfMap - 1) * 2
const percentOfOneItem = 100 / (sizeOfMap * 4 + 1)
const map = ref(createMap(sizeOfMap))

const rows = ref([])

const users = ref(useUser().usersInGame)

if (useUser().usersInGame.length <= 0) router.push('/rooms')

const scores = ref({ 0: 0, 1: 0 })
const isEndGame = ref(false)
let countOfMoves = 0
const hod = ref(1)
const currentHod = computed(() => (hod.value === 1 ? 0 : 1))
const currentUser = computed(() => useUser().usersInGame[currentHod.value])

const enemyCouldRestart = ref(false)
const enemyLeave = ref(false)

const winner = computed(() => {
  if (scores.value[0] > scores.value[1]) return useUser().usersInGame[0]
  return scores.value[0] < scores.value[1] ? useUser().usersInGame[1] : 'DRAW'
})

function checkCell(cell: Cell) {
  // eslint-disable-next-line no-param-reassign
  cell.count--

  if (cell.scores[0] > cell.scores[1] && cell.count === 0) {
    // eslint-disable-next-line no-param-reassign
    cell.whatIsOpp = 0
    scores.value[0]++
  } else if (cell.scores[0] < cell.scores[1] && cell.count === 0) {
    // eslint-disable-next-line no-param-reassign
    cell.whatIsOpp = 1
    scores.value[1]++
  } else if (cell.count === 0) {
    // eslint-disable-next-line no-param-reassign
    cell.whatIsOpp = -1
  }
}

function makeMove(x: number, y: number, isYourMoveParameter: boolean = true) {
  const item = map.value[y][x] as Line
  const { isEdge, whatIsOpp } = item
  const isPoint = (x + y) % 2 === 0

  const isYourMove = currentUser.value.userName === useUser().user.userName

  const isSelect = whatIsOpp !== null && whatIsOpp > -1

  if (isEdge || isPoint || isSelect || (!isYourMove && isYourMoveParameter))
    return

  countOfMoves++

  item.whatIsOpp = currentHod.value

  const topItem = map.value[y - 1][x]
  const bottomItem = map.value[y + 1][x]
  const rightItem = map.value[y][x + 1]
  const leftItem = map.value[y][x - 1]
  let cell
  let cell2
  if (topItem.id.includes('cell')) {
    cell = topItem as Cell
    cell2 = bottomItem as Cell
  } else {
    cell = leftItem as Cell
    cell2 = rightItem as Cell
  }

  cell.scores[currentHod.value]++
  cell2.scores[currentHod.value]++

  checkCell(cell)
  checkCell(cell2)

  if (isYourMoveParameter) {
    useWs().sendMessage({
      meta: 'move',
      event: 'message',
      user: currentUser.value,
      room: useUser().room,
      cordinates: `${x}-${y}`,
    })
  }
  hod.value *= -1

  if (countOfMoves >= allLinesCount) {
    isEndGame.value = true
  }
}

function clear() {
  isEndGame.value = false
  countOfMoves = 0
  scores.value[0] = 0
  scores.value[1] = 0
  map.value = createMap(sizeOfMap)
}

function leaveGameFunction() {
  useWs().sendMessage({
    meta: 'leaveGame',
    event: 'message',
    user: useUser().user,
    room: useUser().room,
  })
  router.push('/rooms')
}

function acceptRestart() {
  useWs().sendMessage({
    meta: 'acceptRestart',
    event: 'message',
    user: useUser().user,
    room: useUser().room,
  })
  clear()
  enemyCouldRestart.value = false
}

function restartGame() {
  useWs().sendMessage({
    meta: 'restart',
    event: 'message',
    user: useUser().user,
    room: useUser().room,
  })
}

useWs().connection.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.type === 'move') {
    const [x, y] = message.cordinates.split('-')
    makeMove(+x, +y, false)
  }
  if (message.type === 'acceptRestart') {
    console.log('accept')

    clear()
  }
  if (message.type === 'restart') {
    enemyCouldRestart.value = true
  }
  if (message.type === 'leaveGame') {
    enemyLeave.value = true
  }
})
</script>

<style>
.game {
  text-align: center;
}
.opp0 {
  background: #f4acc4 !important;
}
.opp1 {
  background: #595b82 !important;
}
.field {
  aspect-ratio: 1 / 1;
  overflow: auto;
  border: 1px solid red;
  gap: 10px;
  flex-direction: column;
  display: flex;
  /* max-height: 100vh;
  width: 100%; */
}

row_ {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
}

.point {
  min-width: 10px;
  min-height: 10px;
  background: gainsboro;
  border-radius: 2px;
  flex-shrink: 0;
}
.line-g {
  /* min-width: 50px;
  min-height: 10px; */
  background: lightgray;
  border-radius: 2px;
  flex-shrink: 0;
}
.line-v {
  /* min-width: 10px;
  min-height: 50px; */
  background: lightgray;
  border-radius: 2px;
  flex-shrink: 0;
}
.edge {
  background: lightslategrey;
}
.cell {
  /* min-width: 50px; */
  flex-shrink: 0;
}

.opp-1 {
  background: gray;
}

button {
  border: none;
  background: lightgreen;
  border-radius: 15px;
  padding: 5px 15px;
  cursor: pointer;
}

.game__results {
  margin-bottom: 15px;
}

.game__player {
  font-weight: 600;
}
.game__player_0 {
  color: #f4acc4;
}
.game__player_1 {
  color: #595b82;
}

.game__score-item {
  width: 50px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-weight: 700;
  font-size: 30px;
}
.game__opponents-item {
  color: black;
  padding: 5px;
  display: inline-block;
}
</style>
