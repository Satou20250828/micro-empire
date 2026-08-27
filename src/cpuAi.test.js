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

  it('機械工学（建築4段階目）解放後は、資源マスに乗るまで1ターンに2マス移動できる', () => {
    // (0,0)cpu都市 → (1,0)はプレイヤーが占有していて移動不可 →
    // 唯一動ける(0,1)？マスへ1マス目、そこから食料マスの(0,2)へ2マス目、で2マス移動する
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 1, col: 0, city: null, terrain: 'gold' },
      { row: 0, col: 1, city: null, terrain: 'mystery' },
      { row: 0, col: 2, city: null, terrain: 'food' },
    ])
    const workers = [makeWorker('cpu', 0, 0), makeWorker('player', 1, 0)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 4, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    const cpuWorker = workers.find((worker) => worker.owner === 'cpu')
    expect(cpuWorker).toMatchObject({ row: 0, col: 2, movedThisTurn: 2 })
  })

  it('機械工学未解放なら1ターンに1マスしか移動しない', () => {
    const board = makeBoard([
      { row: 0, col: 0, city: 'cpu', terrain: null },
      { row: 1, col: 0, city: null, terrain: 'gold' },
      { row: 0, col: 1, city: null, terrain: 'mystery' },
      { row: 0, col: 2, city: null, terrain: 'food' },
    ])
    const workers = [makeWorker('cpu', 0, 0), makeWorker('player', 1, 0)]
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 0, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    const cpuWorker = workers.find((worker) => worker.owner === 'cpu')
    expect(cpuWorker).toMatchObject({ row: 0, col: 1, movedThisTurn: 1 })
  })
})

describe('runCpuTurn - 農業革命による労働者追加', () => {
  it('農業ラインが5段階目に到達した瞬間、CPU都市に労働者が1体追加される', () => {
    const board = makeBoard([{ row: 0, col: 0, city: 'cpu', terrain: null }])
    const workers = []
    const resources = { food: 80, production: 0, gold: 0 }
    const techState = { agriculture: 4, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(techState.agriculture).toBe(5)
    const cpuWorkers = workers.filter((worker) => worker.owner === 'cpu')
    expect(cpuWorkers).toHaveLength(1)
    expect(cpuWorkers[0]).toMatchObject({ row: 0, col: 0 })
  })

  it('農業ラインが4段階目のままでは労働者は追加されない', () => {
    const board = makeBoard([{ row: 0, col: 0, city: 'cpu', terrain: null }])
    const workers = []
    const resources = { food: 0, production: 0, gold: 0 }
    const techState = { agriculture: 4, architecture: 0, currency: 0 }

    runCpuTurn(board, workers, resources, techState)

    expect(techState.agriculture).toBe(4)
    expect(workers).toHaveLength(0)
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
