import { describe, it, expect } from 'vitest'
import { createBoard } from './board.js'
import {
  createWorkers,
  addWorker,
  getAdjacentCells,
  getValidMoves,
  canMoveWorker,
  moveWorker,
  advanceWorkerTurns,
  getWorkersAt,
} from './workers.js'

describe('createWorkers', () => {
  it('自都市・CPU都市それぞれに2体ずつ、都市マスの上に配置される', () => {
    const board = createBoard()
    const workers = createWorkers(board)

    expect(workers).toHaveLength(4)
    expect(workers.filter((worker) => worker.owner === 'player')).toHaveLength(2)
    expect(workers.filter((worker) => worker.owner === 'cpu')).toHaveLength(2)

    const playerCity = board.cells.find((cell) => cell.city === 'player')
    const cpuCity = board.cells.find((cell) => cell.city === 'cpu')
    workers
      .filter((worker) => worker.owner === 'player')
      .forEach((worker) => {
        expect(worker.row).toBe(playerCity.row)
        expect(worker.col).toBe(playerCity.col)
      })
    workers
      .filter((worker) => worker.owner === 'cpu')
      .forEach((worker) => {
        expect(worker.row).toBe(cpuCity.row)
        expect(worker.col).toBe(cpuCity.col)
      })
  })
})

describe('addWorker', () => {
  it('指定した陣営の都市マスに労働者を1体追加する', () => {
    const board = createBoard()
    const workers = createWorkers(board)
    const playerCity = board.cells.find((cell) => cell.city === 'player')

    addWorker(workers, board, 'player')

    const playerWorkers = workers.filter((worker) => worker.owner === 'player')
    expect(playerWorkers).toHaveLength(3)
    expect(playerWorkers[2]).toMatchObject({ row: playerCity.row, col: playerCity.col })
  })
})

describe('getAdjacentCells', () => {
  it('盤面の角では上下左右のうち盤内の2マスだけを返す', () => {
    const adjacent = getAdjacentCells({ row: 0, col: 0 }, 5)
    expect(adjacent).toHaveLength(2)
    expect(adjacent).toEqual(
      expect.arrayContaining([
        { row: 1, col: 0 },
        { row: 0, col: 1 },
      ]),
    )
  })

  it('盤面中央では上下左右4マスを返す', () => {
    const adjacent = getAdjacentCells({ row: 2, col: 2 }, 5)
    expect(adjacent).toHaveLength(4)
  })
})

describe('canMoveWorker / getValidMoves', () => {
  it('相手陣営の労働者がいるマスには移動できない', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: false },
      { id: 'cpu-0', owner: 'cpu', row: 1, col: 2, turnsAtPosition: 1, movedThisTurn: false },
    ]
    const [playerWorker] = workers

    expect(canMoveWorker(workers, playerWorker, 1, 2, 5)).toBe(false)
    expect(canMoveWorker(workers, playerWorker, 3, 2, 5)).toBe(true)
  })

  it('自陣営同士は同じマスへ移動できる（重複可）', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: false },
      { id: 'player-1', owner: 'player', row: 1, col: 2, turnsAtPosition: 1, movedThisTurn: false },
    ]
    const [playerWorker] = workers

    expect(canMoveWorker(workers, playerWorker, 1, 2, 5)).toBe(true)
  })

  it('隣接していないマスへは移動できない', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: false },
    ]
    expect(canMoveWorker(workers, workers[0], 4, 4, 5)).toBe(false)
  })

  it('このターンにすでに移動した労働者は移動できない', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: true },
    ]
    expect(getValidMoves(workers, workers[0], 5)).toEqual([])
  })

  it('moveLimitを2にすると、1回移動しただけではまだ移動できる（機械工学の効果、Issue #22）', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: 1 },
    ]
    expect(getValidMoves(workers, workers[0], 5, 2)).not.toEqual([])
  })

  it('moveLimitに達すると、それ以上は移動できない', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: 2 },
    ]
    expect(getValidMoves(workers, workers[0], 5, 2)).toEqual([])
  })
})

describe('moveWorker', () => {
  it('移動すると位置が更新され、滞在ターン数が1にリセットされる', () => {
    const worker = { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 3, movedThisTurn: false }
    moveWorker(worker, 2, 3)

    expect(worker.row).toBe(2)
    expect(worker.col).toBe(3)
    expect(worker.turnsAtPosition).toBe(1)
    expect(worker.movedThisTurn).toBe(1)
  })
})

describe('advanceWorkerTurns', () => {
  it('動かなかった労働者は滞在ターン数が1つ増える', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: false },
    ]
    advanceWorkerTurns(workers, 5)
    expect(workers[0].turnsAtPosition).toBe(2)
  })

  it('移動した労働者は滞在ターン数を1のまま維持し、移動済みフラグはリセットされる', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: true },
    ]
    advanceWorkerTurns(workers, 5)
    expect(workers[0].turnsAtPosition).toBe(1)
    expect(workers[0].movedThisTurn).toBe(0)
  })

  it('同じマスに3ターン連続滞在すると、4ターン目に自動で隣接マスへ強制移動する', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 3, movedThisTurn: false },
    ]
    advanceWorkerTurns(workers, 5)

    const worker = workers[0]
    const stayedAtSameCell = worker.row === 2 && worker.col === 2
    expect(stayedAtSameCell).toBe(false)
    expect(worker.turnsAtPosition).toBe(1)
    expect(worker.movedThisTurn).toBe(0)
  })

  it('exemptOwnersに含まれる陣営は、3ターン滞在しても強制移動されない（品種改良の効果、Issue #22）', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 3, movedThisTurn: false },
    ]
    advanceWorkerTurns(workers, 5, ['player'])

    expect(workers[0]).toMatchObject({ row: 2, col: 2, turnsAtPosition: 4 })
  })
})

describe('getWorkersAt', () => {
  it('指定したマスにいる労働者だけを返す', () => {
    const workers = [
      { id: 'player-0', owner: 'player', row: 2, col: 2, turnsAtPosition: 1, movedThisTurn: false },
      { id: 'cpu-0', owner: 'cpu', row: 0, col: 0, turnsAtPosition: 1, movedThisTurn: false },
    ]
    expect(getWorkersAt(workers, 2, 2)).toEqual([workers[0]])
    expect(getWorkersAt(workers, 4, 4)).toEqual([])
  })
})
