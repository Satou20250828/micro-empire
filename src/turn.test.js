import { describe, it, expect } from 'vitest'
import { createTurnState, advanceTurn } from './turn.js'

describe('createTurnState', () => {
  it('ターン1の状態で生成される', () => {
    expect(createTurnState()).toEqual({ turn: 1 })
  })
})

describe('advanceTurn', () => {
  it('ターン数を1つ進める', () => {
    const turnState = createTurnState()
    advanceTurn(turnState)
    expect(turnState.turn).toBe(2)
  })
})
