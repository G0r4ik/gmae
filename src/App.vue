<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const scores = ref({ 1: 0, 2: 0 })
let hod = ref(1)
const size = 7

let currentHod = computed(() => (hod.value === 1 ? 1 : 2))

class Line {
  id: string
  whatIsOpp: null
  cssClass: string
  isEdge: boolean
  constructor(direction: String, isEdge: boolean = false) {
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
  scores: { 1: number; 2: number }
  count: number
  constructor() {
    this.id = 'cell'
    this.whatIsOpp = 0
    this.scores = { 1: 0, 2: 0 }
    this.cssClass = 'cell'
    this.count = 0
  }
}

function checkCell(cell: Cell) {
  cell.count--
  console.log(currentHod.value)

  if (cell.scores[1] > cell.scores[2] && cell.count === 0) {
    cell.whatIsOpp = 1

    scores.value[currentHod.value]++
  } else if (cell.scores[1] < cell.scores[2] && cell.count === 0) {
    cell.whatIsOpp = 2
    scores.value[currentHod.value]++
  } else if (cell.count === 0) {
    cell.whatIsOpp = -1
  }
}

function funcHod(x: number, y: number) {
  const item = map[y][x]
  const isEdge = item.isEdge
  const isPoint = (x + y) % 2 === 0
  const isSelect = item.whatIsOpp

  if (isEdge || isPoint || isSelect) return

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
    console.log(row[0])

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
</script>

<template>
  <!-- <div class="intro">
    <div class="container text-center a">
      <button class="btn btn-primary">Играть с компьютером</button>
      <button class="btn btn-primary">Играть с другом</button>
    </div>
    <button class="btn btn-primary">Об игре</button>
  </div> -->
  <main>
    <div class="game">
      <div class="game__inner">
        <div class="container">
          {{ scores[1] }} vs {{ scores[2] }}
          <!--  -->
          <span class="game__player" :class="`game__player_${currentHod}`">
            Игрок {{ currentHod }}
          </span>
          делает ход
          <div class="field">
            <div class="row" v-for="(row, y) of map">
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
  </main>
</template>

<style scoped>
.intro {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.game {
  text-align: center;
}
.a {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}
.opp1 {
  background: coral !important;
}
.opp2 {
  background: lightblue !important;
}
.row {
  display: flex;
  justify-content: center;
}
.point {
  width: 10px;
  height: 10px;
  background: gainsboro;
  margin: 1px;
  border-radius: 2px;
}
.line-g {
  width: 50px;
  height: 10px;
  background: lightgray;
  margin: 1px;
  border-radius: 2px;
}
.line-v {
  width: 10px;
  height: 50px;
  background: lightgray;
  margin: 1px;
  border-radius: 2px;
}
.edge {
  background: lightslategrey;
}
.cell {
  width: 50px;
  margin: 1px;
}
.field {
  /* width: 500px;
  height: 500px; */
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
.game__player_1 {
  color: coral;
}
.game__player_2 {
  color: lightblue;
}
</style>
