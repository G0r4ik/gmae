<template>
  <div class="game">
    <div class="game__inner">
      <div class="container2">
        <div class="game__score">
          <span class="game__score-item opp0">{{ scores[0] }}</span>
          <span class="game__score-item opp1">{{ scores[1] }}</span>
        </div>
        <div class="game__opponents">
          <span class="game__opponents-item opp0">
            {{ users[0] }} <span v-if="users[0] === props.user"> (ВЫ)</span>
          </span>
          <span class="game__opponents-item opp1">
            {{ users[1] }} <span v-if="users[1] === props.user"> (ВЫ)</span>
          </span>
        </div>
        <span class="game__player" :class="`game__player_${currentHod}`">
          Игрок {{ users[currentHod] || '???' }}
        </span>
        делает ход
        <div class="field">
          <div class="row_" v-for="(row, y) of map">
            <div
              v-for="(item, x) of row"
              :class="[
                item.cssClass,
                `opp${item.whatIsOpp}`,
                item.isEdge ? 'edge' : '',
              ]"
              @click="funcHod(x, y)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useWs } from '../ws'

// console.log([...props.users][0])

// import { sendMessage, connection } from '../ws.ts'
// const props = defineProps({
//   room: String,
//   user: String,
// })
const scores = ref({ 0: 0, 1: 0 })
let hod = ref(1)
const size = 15

let currentHod = computed(() => (hod.value === 1 ? 0 : 1))

class Line {
  id: string
  whatIsOpp: null
  cssClass: string
  isEdge: boolean
  constructor(direction: string, isEdge: boolean = false) {
    this.id = 'line'
    direction = direction
    this.whatIsOpp = null
    this.isEdge = isEdge
    this.cssClass = `line-${direction}`
  }
}
class Point {
  id: string
  cssClass: string
  isEdge: boolean
  whatIsOpp: null
  constructor(isEdge: boolean = false) {
    this.id = 'point'
    this.whatIsOpp = null
    this.isEdge = isEdge
    this.cssClass = 'point'
  }
}
class Cell {
  id: string
  whatIsOpp: number
  cssClass: string
  scores: { 0: number; 1: number }
  count: number
  constructor() {
    this.id = 'cell'
    this.whatIsOpp = -2
    this.scores = { 0: 0, 1: 0 }
    this.cssClass = 'cell'
    this.count = 0
  }
}

function checkCell(cell: Cell) {
  cell.count--

  if (cell.scores[0] > cell.scores[1] && cell.count === 0) {
    cell.whatIsOpp = 0
    console.log('1')
    scores.value[0]++
  } else if (cell.scores[0] < cell.scores[1] && cell.count === 0) {
    cell.whatIsOpp = 1
    console.log('2')
    scores.value[1]++
  } else if (cell.count === 0) {
    cell.whatIsOpp = -1
  }
}

// connection.onmessage = function (event) {
//   const message = JSON.parse(event.data)
//   console.log(`Ход был сделан`, message)
//   if (message.user !== currentUser) {
//     const [x, y] = message.message.split('-')
//     funcHod(x, y)
//   }
// }

function funcHod(x: number, y: number, isSvoiMoveFIXME: boolean = true) {
  const item = map[y][x]
  const isEdge = item.isEdge
  const isPoint = (x + y) % 2 === 0
  const isYourMove = currentUser.value === props.user || !isSvoiMoveFIXME

  const isSelect = item.whatIsOpp !== null && item.whatIsOpp > -1

  if (isEdge || isPoint || isSelect || !isYourMove) return
  console.log('сделан')

  item.whatIsOpp = currentHod.value

  const topItem = map[y - 1][x]
  const bottomItem = map[y + 1][x]
  const rightItem = map[y][x + 1]
  const leftItem = map[y][x - 1]
  let cell: Cell
  let cell2: Cell
  if ((topItem as Cell).id.includes('cell')) {
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

  if (isSvoiMoveFIXME) {
    sendMessage({
      meta: 'move',
      event: 'message',
      message: `${currentUser.value} сделал ход в ${props.room}`,
      user: currentUser.value,
      room: props.room,
      cordinates: `${x}-${y}`,
    })
  }
  hod.value *= -1
}

function Row1() {
  return [new Point(), new Line('g')]
}
function Row2() {
  return [new Line('v'), new Cell()]
}

function createMap() {
  const map = []
  for (let i = 0; i < size; i++) {
    map.push([])
    for (let j = 0; j < size; j++) map.at(-1).push(...new Row1())
    map.at(-1).push(new Row1()[0])
    map.push([])
    for (let j = 0; j < size; j++) map.at(-1).push(...new Row2())
    map.at(-1).push(new Row2()[0])
  }
  map.push([])

  for (let j = 0; j < size; j++) map.at(-1).push(...new Row1())
  map.at(-1).push(new Row1()[0])

  createEdges(map)
  setCounts(map)

  return map
}

function createEdges(map) {
  map[0].forEach(item => (item.isEdge = true))
  map.at(-1).forEach(item => (item.isEdge = true))
  for (const row of map) {
    row[0].isEdge = true
    row.at(-1).isEdge = true
  }
}

function setCounts(map) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].id === 'cell') {
        const i1 = map[y - 1][x]
        const i2 = map[y + 1][x]
        const i3 = map[y][x - 1]
        const i4 = map[y][x + 1]
        const count = [i1, i2, i3, i4].filter(i => !i.isEdge).length
        map[y][x].count = count
      }
    }
  }
}

const map = createMap()

setTimeout(() => {
  const rows = document.querySelectorAll('.row_')

  const size_ = 100 / (size * 4 + 1)
  for (const row of rows) {
    for (const child of row.children) {
      if (child.classList.contains('cell')) {
        child.style.width = `${size_ * 3}%`
      }
      if (child.classList.contains('point')) {
        child.style.width = `${size_ * 1}%`
      }
      if (child.classList.contains('line-g')) {
        child.style.width = `${size_ * 3}%`
      }
      if (child.classList.contains('line-v')) {
        child.style.width = `${size_ * 1}%`
      }
    }
  }
  for (let i = 1; i < rows.length; i += 2) {
    rows[i].style.height = `${size_ * 3}%`
  }
  for (let i = 0; i < rows.length; i += 2) {
    rows[i].style.height = `${size_ * 1}%`
  }
}, 100)

defineExpose({ funcHod })
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
}
.row_ {
  display: flex;
  justify-content: center;
}
.point {
  min-width: 10px;
  min-height: 10px;
  background: gainsboro;
  margin: 5px;
  border-radius: 2px;
}
.line-g {
  min-width: 50px;
  min-height: 10px;
  background: lightgray;
  margin: 5px;
  border-radius: 2px;
}
.line-v {
  min-width: 10px;
  min-height: 50px;
  background: lightgray;
  margin: 5px;
  border-radius: 2px;
}
.edge {
  background: lightslategrey;
}
.cell {
  min-width: 50px;
  margin: 5px;
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
  padding: 15px;
  display: inline-block;
}
</style>
