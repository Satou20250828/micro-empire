import { getValidMoves, moveWorker } from './workers.js'
import { unlockNextTech, LINE_KEYS } from './techtree.js'

const RESOURCE_TERRAINS = ['food', 'production', 'gold']

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
function moveCpuWorkers(board, workers) {
  const cpuWorkers = workers.filter((worker) => worker.owner === 'cpu')

  cpuWorkers.forEach((worker) => {
    const currentTerrain = getCellTerrain(board, worker.row, worker.col)
    if (RESOURCE_TERRAINS.includes(currentTerrain)) return

    const candidates = getValidMoves(workers, worker, board.size)
    if (candidates.length === 0) return

    const resourceCandidates = candidates.filter((pos) =>
      RESOURCE_TERRAINS.includes(getCellTerrain(board, pos.row, pos.col)),
    )
    const destination = pickRandom(resourceCandidates.length > 0 ? resourceCandidates : candidates)
    moveWorker(worker, destination.row, destination.col)
  })
}

// CPU都市のテックを自動で解放する。各系統について、資源が足りていれば次の段階を解放する。
function unlockCpuTechs(techState, resources) {
  LINE_KEYS.forEach((lineKey) => {
    unlockNextTech(techState, resources, lineKey)
  })
}

export function runCpuTurn(board, workers, resources, techState) {
  moveCpuWorkers(board, workers)
  unlockCpuTechs(techState, resources)
}
