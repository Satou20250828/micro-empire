import { describe, it, expect, vi, afterEach } from 'vitest'
import { runCpuTurn } from './cpuAi.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function makeBoard(cells) {
  return { size: 5, cells }
}

function makeWorker(owner, row, col, overrides = {}) {
  return { id: `${owner}-${row}-${col}`, owner, row, col, turnsAtPosition: 1, movedThisTurn: false, ...overrides }
}

describe('runCpuTurn - 労働者の移動', () => {
  it('すでに資源マス（食料/生産力/金）にいるCPU労働者は動かさない', () => {
    const board = makeBoard([
      { row: 2, col: 2, city: null, terrain: 'food' },
      { row: 2, col: 1, city: null, terrain: 'gold' },
    ])
    const workers = [makeWorker('cpu', 2, 2)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(workers[0]).toMatchObject({ row: 2, col: 2 })
  })

  it('都市マスにいるCPU労働者は、資源が得られる隣接マスへ移動する', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 0, col: 1, city: null, terrain: 'mystery' },
      { row: 1, col: 0, city: null, terrain: 'food' },
    ])
    const workers = [makeWorker('cpu', 0, 0)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    vi.spyOn(Math, 'random').mockReturnValue(0)
    runCpuTurn(board, workers, resources, techState)

    expect(workers[0]).toMatchObject({ row: 1, col: 0 })
  })

  it('資源マスが隣接になければ？マス等、他の移動先へ移動する', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 0, col: 1, city: null, terrain: 'mystery' },
    ])
    const workers = [makeWorker('cpu', 0, 0)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    vi.spyOn(Math, 'random').mockReturnValue(0)
    runCpuTurn(board, workers, resources, techState)

    // 隣接候補は(1,0)と(0,1)のどちらも資源マスではないため、いずれかへ移動していればよい
    const moved = workers[0].row !== 0 || workers[0].col !== 0
    expect(moved).toBe(true)
  })

  it('相手（プレイヤー）の労働者がいるマスへは移動しない', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 1, col: 0, city: null, terrain: 'food' },
    ])
    const workers = [makeWorker('cpu', 0, 0), makeWorker('player', 1, 0)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    const cpuWorker = workers.find((worker) => worker.owner === 'cpu')
    expect(cpuWorker).not.toMatchObject({ row: 1, col: 0 })
  })

  it('このターンにすでに移動済みの労働者は動かさない', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 1, col: 0, city: null, terrain: 'food' },
    ])
    const workers = [makeWorker('cpu', 0, 0, { movedThisTurn: true })]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(workers[0]).toMatchObject({ row: 0, col: 0 })
  })
})

describe('runCpuTurn - テックの自動解放', () => {
  it('資源が足りていれば、各系統の次の技術を自動で解放する', () => {
    const board = makeBoard([])
    const workers = []
    const resources = { food: 10, production: 10, gold: 10 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(techState).toEqual({ agriculture: 1, architecture: 1, currency: 1 })
    expect(resources).toEqual({ food: 0, production: 0, gold: 0 })
  })

  it('資源が足りない系統は解放しない', () => {
    const board = makeBoard([])
    const workers = []
    const resources = { food: 5, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(techState).toEqual({ agriculture: 0, architecture: 0, currency: 0 })
    expect(resources.food).toBe(5)
  })
})
