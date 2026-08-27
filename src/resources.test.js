import { describe, it, expect } from 'vitest'
import { createResources, addResources } from './resources.js'

describe('createResources', () => {
  it('食料・生産力・金がすべて0の状態で生成される', () => {
    expect(createResources()).toEqual({ food: 0, production: 0, gold: 0 })
  })
})

describe('addResources', () => {
  it('指定した資源をそれぞれ加算する', () => {
    const resources = createResources()
    addResources(resources, { food: 2, production: 1, gold: 1 })
    expect(resources).toEqual({ food: 2, production: 1, gold: 1 })
  })

  it('指定しなかった資源は変化しない', () => {
    const resources = createResources()
    addResources(resources, { food: 5 })
    expect(resources).toEqual({ food: 5, production: 0, gold: 0 })
  })
})
