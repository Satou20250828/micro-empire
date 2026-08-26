import { describe, it, expect } from 'vitest'
import { createBoard } from './board.js'

describe('createBoard', () => {
  it('5x5、25マスの盤面を生成する', () => {
    const board = createBoard()
    expect(board.size).toBe(5)
    expect(board.cells).toHaveLength(25)
  })

  it('自都市は右下、CPU都市は左上に配置される', () => {
    const board = createBoard()
    const playerCity = board.cells.find((cell) => cell.city === 'player')
    const cpuCity = board.cells.find((cell) => cell.city === 'cpu')

    expect(playerCity).toMatchObject({ row: 4, col: 4 })
    expect(cpuCity).toMatchObject({ row: 0, col: 0 })
  })

  it('都市マスは地形（terrain）を持たない', () => {
    const board = createBoard()
    const cityCells = board.cells.filter((cell) => cell.city)
    expect(cityCells).toHaveLength(2)
    cityCells.forEach((cell) => {
      expect(cell.terrain).toBeNull()
    })
  })

  it('都市マス以外の23マスには、ちょうど3マスの？マスと20マスの地形（食料/生産力/金）が割り当てられる', () => {
    const board = createBoard()
    const nonCityCells = board.cells.filter((cell) => !cell.city)
    expect(nonCityCells).toHaveLength(23)

    const mysteryCells = nonCityCells.filter((cell) => cell.terrain === 'mystery')
    const terrainCells = nonCityCells.filter((cell) =>
      ['food', 'production', 'gold'].includes(cell.terrain),
    )
    expect(mysteryCells).toHaveLength(3)
    expect(terrainCells).toHaveLength(20)
  })
})
