import { describe, it, expect } from 'vitest'
import {
  createTechState,
  getNextTech,
  canUnlockNext,
  unlockNextTech,
  getProductionBonus,
  getEffectiveCost,
} from './techtree.js'

describe('createTechState', () => {
  it('すべての系統が未解放（0）の状態で生成される', () => {
    expect(createTechState()).toEqual({ agriculture: 0, architecture: 0, currency: 0 })
  })
})

describe('getNextTech', () => {
  it('未解放の系統では1段階目が次の技術になる', () => {
    const techState = createTechState()
    expect(getNextTech(techState, 'agriculture')).toMatchObject({ name: '農耕', cost: 10 })
  })

  it('全5段階を解放済みの場合はnullを返す', () => {
    const techState = { agriculture: 5, architecture: 0, currency: 0 }
    expect(getNextTech(techState, 'agriculture')).toBeNull()
  })
})

describe('canUnlockNext / unlockNextTech', () => {
  it('資源が足りない場合は解放できない', () => {
    const techState = createTechState()
    const resources = { food: 5, production: 0, gold: 0 }
    expect(canUnlockNext(techState, resources, 'agriculture')).toBe(false)
    expect(unlockNextTech(techState, resources, 'agriculture')).toBe(false)
    expect(techState.agriculture).toBe(0)
    expect(resources.food).toBe(5)
  })

  it('資源が足りていれば解放でき、コスト分が消費される', () => {
    const techState = createTechState()
    const resources = { food: 10, production: 0, gold: 0 }
    expect(unlockNextTech(techState, resources, 'agriculture')).toBe(true)
    expect(techState.agriculture).toBe(1)
    expect(resources.food).toBe(0)
  })

  it('前提技術を解放しないと次の段階へは進めない（順番どおりにしか解放できない）', () => {
    const techState = createTechState()
    const resources = { food: 100, production: 0, gold: 0 }
    unlockNextTech(techState, resources, 'agriculture')
    expect(getNextTech(techState, 'agriculture')).toMatchObject({ name: '灌漑', cost: 20 })
    unlockNextTech(techState, resources, 'agriculture')
    expect(techState.agriculture).toBe(2)
  })

  it('全段階解放済みの場合はそれ以上解放できない', () => {
    const techState = { agriculture: 5, architecture: 0, currency: 0 }
    const resources = { food: 1000, production: 0, gold: 0 }
    expect(unlockNextTech(techState, resources, 'agriculture')).toBe(false)
    expect(techState.agriculture).toBe(5)
  })
})

describe('getProductionBonus', () => {
  it('未解放の系統に対応する資源はボーナス0', () => {
    const techState = createTechState()
    expect(getProductionBonus(techState, 'food')).toBe(0)
  })

  it('解放段階数に応じたボーナスを返す（資源の系統マッピングどおり）', () => {
    const techState = { agriculture: 2, architecture: 1, currency: 0 }
    expect(getProductionBonus(techState, 'food')).toBe(2)
    expect(getProductionBonus(techState, 'production')).toBe(1)
    expect(getProductionBonus(techState, 'gold')).toBe(0)
  })

  it('4〜5段階目を解放していても数値ボーナスは3で頭打ちになる', () => {
    const techState = { agriculture: 5, architecture: 0, currency: 0 }
    expect(getProductionBonus(techState, 'food')).toBe(3)
  })
})

describe('getEffectiveCost（資本主義によるコスト割引、Issue #22）', () => {
  it('資本主義（貨幣5段階目）未解放なら通常コストのまま', () => {
    const techState = { agriculture: 0, architecture: 0, currency: 4 }
    expect(getEffectiveCost(techState, 'agriculture', 100)).toBe(100)
  })

  it('資本主義解放済みなら農業/建築ラインのコストが20%引きになる', () => {
    const techState = { agriculture: 0, architecture: 0, currency: 5 }
    expect(getEffectiveCost(techState, 'agriculture', 100)).toBe(80)
    expect(getEffectiveCost(techState, 'architecture', 100)).toBe(80)
  })

  it('資本主義解放済みでも貨幣ライン自体のコストは割引されない', () => {
    const techState = { agriculture: 0, architecture: 0, currency: 5 }
    expect(getEffectiveCost(techState, 'currency', 100)).toBe(100)
  })

  it('unlockNextTechで割引後のコストが実際に消費される', () => {
    const techState = { agriculture: 0, architecture: 0, currency: 5 }
    const resources = { food: 8, production: 0, gold: 0 }
    expect(unlockNextTech(techState, resources, 'agriculture')).toBe(true)
    expect(resources.food).toBe(0)
  })
})
