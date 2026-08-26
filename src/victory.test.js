import { describe, it, expect } from 'vitest'
import {
  checkVictory,
  determineWinner,
  getResourceThreshold,
  RESOURCE_VICTORY_THRESHOLD,
} from './victory.js'

function makeTechState(overrides = {}) {
  return { agriculture: 0, architecture: 0, currency: 0, ...overrides }
}

describe('checkVictory', () => {
  it('どちらの条件も満たさない場合はnullを返す', () => {
    const resources = { food: 0, production: 0, gold: 0 }
    expect(checkVictory(resources, makeTechState())).toBeNull()
  })

  it('3系統すべて5段階解放済みなら勝因はtech', () => {
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = makeTechState({ agriculture: 5, architecture: 5, currency: 5 })
    expect(checkVictory(resources, techState)).toBe('tech')
  })

  it('1系統でも5段階未満なら勝因はtechにならない', () => {
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = makeTechState({ agriculture: 5, architecture: 4, currency: 5 })
    expect(checkVictory(resources, techState)).toBeNull()
  })

  it('資源合計がしきい値以上なら勝因はresource', () => {
    const resources = { food: 50, production: 50, gold: 50 }
    expect(getSum(resources)).toBe(RESOURCE_VICTORY_THRESHOLD)
    expect(checkVictory(resources, makeTechState())).toBe('resource')
  })

  it('資源合計がしきい値未満なら勝利ではない', () => {
    const resources = { food: 50, production: 50, gold: 49 }
    expect(checkVictory(resources, makeTechState())).toBeNull()
  })
})

describe('getResourceThreshold（金融によるしきい値引き下げ、Issue #22）', () => {
  it('金融（貨幣4段階目）未解放なら通常のしきい値のまま', () => {
    expect(getResourceThreshold(makeTechState({ currency: 3 }))).toBe(RESOURCE_VICTORY_THRESHOLD)
  })

  it('金融解放済みならしきい値が20%下がる', () => {
    const discounted = Math.round(RESOURCE_VICTORY_THRESHOLD * 0.8)
    expect(getResourceThreshold(makeTechState({ currency: 4 }))).toBe(discounted)
  })

  it('引き下げられたしきい値はcheckVictoryにも反映される', () => {
    const techState = makeTechState({ currency: 4 })
    const threshold = getResourceThreshold(techState)
    const resources = { food: threshold, production: 0, gold: 0 }
    expect(checkVictory(resources, techState)).toBe('resource')

    const belowThreshold = { food: threshold - 1, production: 0, gold: 0 }
    expect(checkVictory(belowThreshold, techState)).toBeNull()
  })
})

function getSum(resources) {
  return resources.food + resources.production + resources.gold
}

describe('determineWinner', () => {
  it('誰も勝利条件を満たしていなければnullを返す', () => {
    const resources = { food: 0, production: 0, gold: 0 }
    const result = determineWinner({
      playerResources: resources,
      playerTech: makeTechState(),
      cpuResources: resources,
      cpuTech: makeTechState(),
    })
    expect(result).toBeNull()
  })

  it('プレイヤーのみ条件を満たしていればプレイヤーの勝利', () => {
    const result = determineWinner({
      playerResources: { food: 150, production: 0, gold: 0 },
      playerTech: makeTechState(),
      cpuResources: { food: 0, production: 0, gold: 0 },
      cpuTech: makeTechState(),
    })
    expect(result).toEqual({ winner: 'player', reason: 'resource' })
  })

  it('CPUのみ条件を満たしていればCPUの勝利', () => {
    const result = determineWinner({
      playerResources: { food: 0, production: 0, gold: 0 },
      playerTech: makeTechState(),
      cpuResources: { food: 0, production: 0, gold: 0 },
      cpuTech: makeTechState({ agriculture: 5, architecture: 5, currency: 5 }),
    })
    expect(result).toEqual({ winner: 'cpu', reason: 'tech' })
  })

  it('両者が同時に条件を満たした場合はプレイヤー優先', () => {
    const result = determineWinner({
      playerResources: { food: 150, production: 0, gold: 0 },
      playerTech: makeTechState(),
      cpuResources: { food: 150, production: 0, gold: 0 },
      cpuTech: makeTechState(),
    })
    expect(result).toEqual({ winner: 'player', reason: 'resource' })
  })
})
