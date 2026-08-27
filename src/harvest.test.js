import { describe, it, expect } from 'vitest'
import { harvestResources } from './harvest.js'

function makeBoard(cells) {
  return { size: 5, cells }
}

function makeWorker(owner, row, col) {
  return { id: `${owner}-${row}-${col}`, owner, row, col, turnsAtPosition: 1, movedThisTurn: false }
}

describe('harvestResources', () => {
  it('労働者がいるマスの地形に応じて、所属陣営の資源が加算される', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: null, terrain: 'food' },
      { row: 0, col: 1, city: null, terrain: 'gold' },
    ])
    const workers = [makeWorker('player', 0, 0), makeWorker('cpu', 0, 1)]

    const totals = harvestResources(board, workers)

    expect(totals.player).toEqual({ food: 1, production: 0, gold: 0 })
    expect(totals.cpu).toEqual({ food: 0, production: 0, gold: 1 })
  })

  it('同じ地形マスに自陣営の労働者が複数いると、その分だけ加算される', () => {
    const board = makeBoard([{ row: 0, col: 0, city: null, terrain: 'production' }])
    const workers = [makeWorker('player', 0, 0), makeWorker('player', 0, 0)]

    const totals = harvestResources(board, workers)

    expect(totals.player.production).toBe(2)
  })

  it('都市マス（terrainがnull）にいる労働者からは資源を得られない', () => {
    const board = makeBoard([{ row: 4, col: 4, city: 'player', terrain: null }])
    const workers = [makeWorker('player', 4, 4)]

    const totals = harvestResources(board, workers)

    expect(totals.player).toEqual({ food: 0, production: 0, gold: 0 })
  })

  it('？マスにいる労働者からは資源を得られない（？マスの効果はmystery.jsが別途処理する）', () => {
    const board = makeBoard([{ row: 2, col: 2, city: null, terrain: 'mystery' }])
    const workers = [makeWorker('player', 2, 2)]

    const totals = harvestResources(board, workers)

    expect(totals.player).toEqual({ food: 0, production: 0, gold: 0 })
  })

  it('techStatesを渡すと、テックツリーの産出ボーナスが基礎値に加算される', () => {
    const board = makeBoard([{ row: 0, col: 0, city: null, terrain: 'food' }])
    const workers = [makeWorker('player', 0, 0)]
    const techStates = { player: { agriculture: 2, architecture: 0, currency: 0 }, cpu: { agriculture: 0, architecture: 0, currency: 0 } }

    const totals = harvestResources(board, workers, techStates)

    expect(totals.player.food).toBe(3)
  })

  it('techStatesを省略した場合はボーナスなし（基礎値のみ）', () => {
    const board = makeBoard([{ row: 0, col: 0, city: null, terrain: 'food' }])
    const workers = [makeWorker('player', 0, 0)]

    const totals = harvestResources(board, workers)

    expect(totals.player.food).toBe(1)
  })
})
