import { describe, it, expect } from 'vitest'
import { checkVictory, determineWinner, getResourceThreshold, DIFFICULTY_LEVELS } from './victory.js'

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

  it('資源合計が既定（普通）のしきい値以上なら勝因はresource', () => {
    const threshold = DIFFICULTY_LEVELS.normal.threshold
    const resources = { food: threshold, production: 0, gold: 0 }
    expect(checkVictory(resources, makeTechState())).toBe('resource')
  })

  it('資源合計が既定（普通）のしきい値未満なら勝利ではない', () => {
    const threshold = DIFFICULTY_LEVELS.normal.threshold
    const resources = { food: threshold - 1, production: 0, gold: 0 }
    expect(checkVictory(resources, makeTechState())).toBeNull()
  })

  it('難易度ごとにしきい値が異なる', () => {
    const resources = { food: DIFFICULTY_LEVELS.easy.threshold, production: 0, gold: 0 }
    expect(checkVictory(resources, makeTechState(), 'easy')).toBe('resource')
    expect(checkVictory(resources, makeTechState(), 'hard')).toBeNull()
  })
})

describe('getResourceThreshold', () => {
  it('難易度を指定しない場合は「普通」のしきい値になる', () => {
    expect(getResourceThreshold(makeTechState())).toBe(DIFFICULTY_LEVELS.normal.threshold)
  })

  it('難易度ごとに基準となるしきい値が異なる', () => {
    expect(getResourceThreshold(makeTechState(), 'easy')).toBe(DIFFICULTY_LEVELS.easy.threshold)
    expect(getResourceThreshold(makeTechState(), 'hard')).toBe(DIFFICULTY_LEVELS.hard.threshold)
  })

  it('金融（貨幣4段階目）未解放なら難易度どおりのしきい値のまま', () => {
    expect(getResourceThreshold(makeTechState({ currency: 3 }), 'hard')).toBe(
      DIFFICULTY_LEVELS.hard.threshold,
    )
  })

  it('金融解放済みなら難易度の基準値から20%下がる', () => {
    const discounted = Math.round(DIFFICULTY_LEVELS.hard.threshold * 0.8)
    expect(getResourceThreshold(makeTechState({ currency: 4 }), 'hard')).toBe(discounted)
  })

  it('引き下げられたしきい値はcheckVictoryにも反映される', () => {
    const techState = makeTechState({ currency: 4 })
    const threshold = getResourceThreshold(techState, 'hard')
    const resources = { food: threshold, production: 0, gold: 0 }
    expect(checkVictory(resources, techState, 'hard')).toBe('resource')

    const belowThreshold = { food: threshold - 1, production: 0, gold: 0 }
    expect(checkVictory(belowThreshold, techState, 'hard')).toBeNull()
  })
})

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
      playerResources: { food: DIFFICULTY_LEVELS.hard.threshold, production: 0, gold: 0 },
      playerTech: makeTechState(),
      cpuResources: { food: 0, production: 0, gold: 0 },
      cpuTech: makeTechState(),
      difficulty: 'hard',
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
    const threshold = DIFFICULTY_LEVELS.hard.threshold
    const result = determineWinner({
      playerResources: { food: threshold, production: 0, gold: 0 },
      playerTech: makeTechState(),
      cpuResources: { food: threshold, production: 0, gold: 0 },
      cpuTech: makeTechState(),
      difficulty: 'hard',
    })
    expect(result).toEqual({ winner: 'player', reason: 'resource' })
  })
})

