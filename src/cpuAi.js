import { getValidMoves, moveWorker, addWorker } from './workers.js'
import { unlockNextTech, LINE_KEYS } from './techtree.js'

const RESOURCE_TERRAINS = ['food', 'production', 'gold']
const MACHINERY_TIER = 4
const AGRICULTURE_REVOLUTION_TIER = 5

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getCellTerrain(board, row, col) {
  const cell = board.cells.find((c) => c.row === row && c.col === col)
  return cell ? cell.terrain : null
}

// CPU都市の労働者を自動で動かす。既に食料/生産力/金のマスにいる場合はそのまま
// 留まって稼ぎ続け、都市マス・？マスにいる場合は資源が稼げる隣接マスを優先して
// 移動する（見つからなければ？マス等の他の移動先へ、それも無ければ何もしない）。
// 「機械工学」（建築4段階目）解放後は、資源マスに乗るまで1ターンに最大2マス移動できる。
function moveCpuWorkers(board, workers, techState) {
  const cpuWorkers = workers.filter((worker) => worker.owner === 'cpu')
  const moveLimit = techState.architecture >= MACHINERY_TIER ? 2 : 1

  cpuWorkers.forEach((worker) => {
    while (worker.movedThisTurn < moveLimit) {
      const currentTerrain = getCellTerrain(board, worker.row, worker.col)
      if (RESOURCE_TERRAINS.includes(currentTerrain)) break

      const candidates = getValidMoves(workers, worker, board.size, moveLimit)
      if (candidates.length === 0) break

      const resourceCandidates = candidates.filter((pos) =>
        RESOURCE_TERRAINS.includes(getCellTerrain(board, pos.row, pos.col)),
      )
      const destination = pickRandom(resourceCandidates.length > 0 ? resourceCandidates : candidates)
      moveWorker(worker, destination.row, destination.col)
    }
  })
}

// CPU都市のテックを自動で解放する。各系統について、資源が足りていれば次の段階を解放する。
// 農業ラインが5段階目（農業革命）に達した瞬間、CPU都市に労働者を1体追加する。
function unlockCpuTechs(techState, resources, workers, board) {
  LINE_KEYS.forEach((lineKey) => {
    const beforeTier = techState[lineKey]
    const unlocked = unlockNextTech(techState, resources, lineKey)
    if (unlocked && lineKey === 'agriculture' && techState.agriculture === AGRICULTURE_REVOLUTION_TIER) {
      if (beforeTier === AGRICULTURE_REVOLUTION_TIER - 1) {
        addWorker(workers, board, 'cpu')
      }
    }
  })
}

export function runCpuTurn(board, workers, resources, techState) {
  moveCpuWorkers(board, workers, techState)
  unlockCpuTechs(techState, resources, workers, board)
}
