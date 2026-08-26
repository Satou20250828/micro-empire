const WORKERS_PER_SIDE = 2
const STAY_LIMIT = 3

const DIRECTIONS = [
  { dRow: -1, dCol: 0 },
  { dRow: 1, dCol: 0 },
  { dRow: 0, dCol: -1 },
  { dRow: 0, dCol: 1 },
]

export const OWNER_STYLES = {
  player: { emoji: '🧑‍🌾', ring: 'ring-2 ring-amber-500', bg: 'bg-amber-100' },
  cpu: { emoji: '🧑‍🌾', ring: 'ring-2 ring-rose-500', bg: 'bg-rose-100' },
}

function makeWorker(owner, index, cityCell) {
  return {
    id: `${owner}-${index}`,
    owner,
    row: cityCell.row,
    col: cityCell.col,
    turnsAtPosition: 1,
    movedThisTurn: false,
  }
}

export function createWorkers(board) {
  const cpuCity = board.cells.find((cell) => cell.city === 'cpu')
  const playerCity = board.cells.find((cell) => cell.city === 'player')

  const workers = []
  for (let i = 0; i < WORKERS_PER_SIDE; i++) {
    workers.push(makeWorker('cpu', i, cpuCity))
    workers.push(makeWorker('player', i, playerCity))
  }
  return workers
}

export function getAdjacentCells(worker, boardSize) {
  return DIRECTIONS.map(({ dRow, dCol }) => ({
    row: worker.row + dRow,
    col: worker.col + dCol,
  })).filter((pos) => pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize)
}

function isOccupiedByOpponent(workers, owner, row, col) {
  return workers.some((worker) => worker.owner !== owner && worker.row === row && worker.col === col)
}

export function getValidMoves(workers, worker, boardSize) {
  if (worker.movedThisTurn) return []
  return getAdjacentCells(worker, boardSize).filter(
    (pos) => !isOccupiedByOpponent(workers, worker.owner, pos.row, pos.col),
  )
}

export function canMoveWorker(workers, worker, row, col, boardSize) {
  return getValidMoves(workers, worker, boardSize).some((pos) => pos.row === row && pos.col === col)
}

export function moveWorker(worker, row, col) {
  worker.row = row
  worker.col = col
  worker.turnsAtPosition = 1
  worker.movedThisTurn = true
}

// ターン送り時に呼び出す。今ターン動かなかった労働者の滞在ターン数を進め、
// 3ターン連続で同じマスにいた労働者は、盤面上の空いている隣接マスへ強制移動させる。
// その後、全労働者の「このターン移動済みか」フラグをリセットする。
export function advanceWorkerTurns(workers, boardSize) {
  workers.forEach((worker) => {
    if (!worker.movedThisTurn) {
      worker.turnsAtPosition += 1
    }
  })

  workers.forEach((worker) => {
    if (worker.turnsAtPosition > STAY_LIMIT) {
      const destinations = getValidMoves(workers, { ...worker, movedThisTurn: false }, boardSize)
      if (destinations.length > 0) {
        const destination = destinations[Math.floor(Math.random() * destinations.length)]
        moveWorker(worker, destination.row, destination.col)
      } else {
        worker.turnsAtPosition = 1
      }
    }
  })

  workers.forEach((worker) => {
    worker.movedThisTurn = false
  })
}

export function getWorkersAt(workers, row, col) {
  return workers.filter((worker) => worker.row === row && worker.col === col)
}
