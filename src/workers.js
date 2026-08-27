const WORKERS_PER_SIDE = 2
const STAY_LIMIT = 3
const DEFAULT_MOVE_LIMIT = 1

const DIRECTIONS = [
  { dRow: -1, dCol: 0 },
  { dRow: 1, dCol: 0 },
  { dRow: 0, dCol: -1 },
  { dRow: 0, dCol: 1 },
]

export const OWNER_STYLES = {
  player: { icon: 'person', iconColor: 'text-blue-600', ring: 'ring-2 ring-blue-500', bg: 'bg-blue-100' },
  cpu: { icon: 'person', iconColor: 'text-rose-600', ring: 'ring-2 ring-rose-500', bg: 'bg-rose-100' },
}

function makeWorker(owner, index, cityCell) {
  return {
    id: `${owner}-${index}`,
    owner,
    row: cityCell.row,
    col: cityCell.col,
    turnsAtPosition: 1,
    movedThisTurn: 0,
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

// テックツリー「農業革命」（Issue #22）解放時に、対象陣営の都市マスへ労働者を1体追加する。
export function addWorker(workers, board, owner) {
  const cityCell = board.cells.find((cell) => cell.city === owner)
  const index = workers.filter((worker) => worker.owner === owner).length
  workers.push(makeWorker(owner, index, cityCell))
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

// moveLimit：1ターンに移動できる回数の上限（テックツリー「機械工学」解放で2になる、Issue #22）。
export function getValidMoves(workers, worker, boardSize, moveLimit = DEFAULT_MOVE_LIMIT) {
  if (worker.movedThisTurn >= moveLimit) return []
  return getAdjacentCells(worker, boardSize).filter(
    (pos) => !isOccupiedByOpponent(workers, worker.owner, pos.row, pos.col),
  )
}

export function canMoveWorker(workers, worker, row, col, boardSize, moveLimit = DEFAULT_MOVE_LIMIT) {
  return getValidMoves(workers, worker, boardSize, moveLimit).some(
    (pos) => pos.row === row && pos.col === col,
  )
}

export function moveWorker(worker, row, col) {
  worker.row = row
  worker.col = col
  worker.turnsAtPosition = 1
  worker.movedThisTurn = (worker.movedThisTurn || 0) + 1
}

// ターン送り時に呼び出す。今ターン動かなかった労働者の滞在ターン数を進め、
// 3ターン連続で同じマスにいた労働者は、盤面上の空いている隣接マスへ強制移動させる
// （ただしexemptOwnersに含まれる陣営は、テックツリー「品種改良」の効果で対象外、Issue #22）。
// その後、全労働者の「このターン移動した回数」をリセットする。
export function advanceWorkerTurns(workers, boardSize, exemptOwners = []) {
  const exemptSet = new Set(exemptOwners)

  workers.forEach((worker) => {
    if (!worker.movedThisTurn) {
      worker.turnsAtPosition += 1
    }
  })

  workers.forEach((worker) => {
    if (exemptSet.has(worker.owner)) return
    if (worker.turnsAtPosition > STAY_LIMIT) {
      const destinations = getValidMoves(workers, { ...worker, movedThisTurn: 0 }, boardSize)
      if (destinations.length > 0) {
        const destination = destinations[Math.floor(Math.random() * destinations.length)]
        moveWorker(worker, destination.row, destination.col)
      } else {
        worker.turnsAtPosition = 1
      }
    }
  })

  workers.forEach((worker) => {
    worker.movedThisTurn = 0
  })
}

export function getWorkersAt(workers, row, col) {
  return workers.filter((worker) => worker.row === row && worker.col === col)
}
