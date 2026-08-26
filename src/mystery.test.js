import { describe, it, expect, vi, afterEach } from 'vitest'
import { rollMysteryEffect, applyMysteryEffects } from './mystery.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function makeBoard(cells) {
  return { size: 5, cells }
}

function makeWorker(owner, row, col) {
  return { id: `${owner}-${row}-${col}`, owner, row, col, turnsAtPosition: 1, movedThisTurn: false }
}

describe('rollMysteryEffect', () => {
  it('資源ボーナス（プラス）を抽選できる', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)
    expect(rollMysteryEffect()).toEqual({ type: 'bonus', resource: 'gold', amount: 2 })
  })

  it('何も起きないケースでは資源種別の抽選を行わない', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.6)
    expect(rollMysteryEffect()).toEqual({ type: 'nothing', resource: null, amount: 0 })
    expect(randomSpy).toHaveBeenCalledTimes(1)
  })

  it('資源ロス（マイナス）を抽選できる', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1)
    expect(rollMysteryEffect()).toEqual({ type: 'loss', resource: 'food', amount: -1 })
  })
})

describe('applyMysteryEffects', () => {
  it('？マスにいる労働者の効果を、所属陣営の資源プールに反映する', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)
    const board = makeBoard([{ row: 2, col: 2, city: null, terrain: 'mystery' }])
    const workers = [makeWorker('player', 2, 2)]
    const pools = { player: { food: 0, production: 0, gold: 0 }, cpu: { food: 0, production: 0, gold: 0 } }

    const events = applyMysteryEffects(board, workers, pools)

    expect(pools.player.gold).toBe(2)
    expect(events).toEqual([{ workerId: 'player-2-2', owner: 'player', type: 'bonus', resource: 'gold', amount: 2 }])
  })

  it('資源ロスで手持ちが不足する場合は0未満にならない', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1)
    const board = makeBoard([{ row: 2, col: 2, city: null, terrain: 'mystery' }])
    const workers = [makeWorker('cpu', 2, 2)]
    const pools = { player: { food: 0, production: 0, gold: 0 }, cpu: { food: 0, production: 0, gold: 0 } }

    applyMysteryEffects(board, workers, pools)

    expect(pools.cpu.food).toBe(0)
  })

  it('？マス以外にいる労働者には効果が発生しない', () => {
    const board = makeBoard([{ row: 2, col: 2, city: null, terrain: 'food' }])
    const workers = [makeWorker('player', 2, 2)]
    const pools = { player: { food: 0, production: 0, gold: 0 }, cpu: { food: 0, production: 0, gold: 0 } }

    const events = applyMysteryEffects(board, workers, pools)

    expect(events).toEqual([])
    expect(pools.player.food).toBe(0)
  })
})
