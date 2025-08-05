/* eslint-disable unicorn/prefer-at */
/* eslint-disable max-classes-per-file */
export class Line {
  id: string

  whatIsOpp: null | number

  cssClass: string

  isEdge: boolean

  styles: { width?: string }

  constructor(direction: string, isEdge: boolean = false) {
    this.id = 'line'
    this.whatIsOpp = null
    this.isEdge = isEdge
    this.cssClass = `line-${direction}`
    this.styles = {}
  }
}

class Point {
  id: string

  cssClass: string

  isEdge: boolean

  whatIsOpp: null | number

  styles: { width?: string }

  constructor(isEdge: boolean = false) {
    this.id = 'point'
    this.whatIsOpp = null
    this.isEdge = isEdge
    this.cssClass = 'point'
    this.styles = {}
  }
}

export class Cell {
  id: string

  whatIsOpp: number | number

  cssClass: string

  scores: { 0: number; 1: number }

  count: number

  styles: { width?: string }

  constructor() {
    this.id = 'cell'
    this.whatIsOpp = -2
    this.scores = { 0: 0, 1: 0 }
    this.cssClass = 'cell'
    this.count = 0
    this.styles = {}
  }
}

function Row1(): (Point | Line)[] {
  return [new Point(), new Line('g')]
}
function Row2(): (Line | Cell)[] {
  return [new Line('v'), new Cell()]
}

function setCounts(mapFIX: (Point | Line | Cell)[][]) {
  const map = mapFIX
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] instanceof Cell) {
        const i1 = map[y - 1][x] as Point | Line
        const i2 = map[y + 1][x] as Point | Line
        const i3 = map[y][x - 1] as Point | Line
        const i4 = map[y][x + 1] as Point | Line
        const count = [i1, i2, i3, i4].filter(i => !i.isEdge).length
        const cell = map[y][x] as Cell
        cell.count = count
      }
    }
  }
  return map
}

function createEdges(map: (Line | Point | Cell)[][]) {
  for (const item of map[0]) {
    const element = item as Point | Line
    element.isEdge = true
  }
  for (const item of map[map.length - 1]) {
    const element = item as Point | Line
    element.isEdge = true
  }
  for (const row of map) {
    const row2 = row as (Point | Line)[]
    row2[0].isEdge = true
    row2[row2.length - 1].isEdge = true
  }
}

export function createMap(size = 5) {
  let map: (Line | Cell | Point)[][] = []

  for (let i = 0; i < size; i++) {
    map.push([])
    for (let index = 0; index < size; index++)
      map[map.length - 1].push(...Row1())
    map[map.length - 1].push(Row1()[0])

    map.push([])
    for (let index = 0; index < size; index++)
      map[map.length - 1].push(...Row2())
    map[map.length - 1].push(Row2()[0])
  }

  map.push([])
  for (let i = 0; i < size; i++) map[map.length - 1].push(...Row1())
  map[map.length - 1].push(Row1()[0])

  createEdges(map)
  map = setCounts(map)

  const widthPercentOfPoint = 100 / (size * 4 + 1)
  for (const row of map) {
    for (const child of row) {
      if (child.id.includes('cell')) {
        child.styles.width = `${widthPercentOfPoint * 3}%`
      }
      if (child.id.includes('point')) {
        child.styles.width = `${widthPercentOfPoint * 1}%`
      }
      if (child.cssClass.includes('line-g')) {
        child.styles.width = `${widthPercentOfPoint * 3}%`
      }
      if (child.cssClass.includes('line-v')) {
        child.styles.width = `${widthPercentOfPoint * 1}%`
      }
    }
  }

  return map
}
