import { OWNER_STYLES, getWorkersAt } from './workers.js'

const BOARD_SIZE = 5
const MYSTERY_COUNT = 3

const CITY_STYLES = {
  player: { emoji: '🏰', ring: 'ring-4 ring-amber-400', label: '自都市' },
  cpu: { emoji: '🏯', ring: 'ring-4 ring-rose-400', label: 'CPU都市' },
}

const CITY_TONE = 'bg-stone-200'

const TERRAIN_TYPES = ['food', 'production', 'gold']

const TERRAIN_META = {
  food: { emoji: '🌾', tone: 'bg-lime-200', label: '食料' },
  production: { emoji: '⚙️', tone: 'bg-amber-200', label: '生産力' },
  gold: { emoji: '💰', tone: 'bg-yellow-200', label: '金' },
  mystery: { emoji: '❓', tone: 'bg-slate-300', label: '？マス' },
}

function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 都市マスを除いた各マスの地形を、なるべく均等（食料/生産力/金がおよそ均等）に配りつつ、
// どのマスがどの地形になるかはシャッフルでランダムに決める。都市マスはコマの初期配置場所
// のため地形（？マスも含む）を持たない。
function assignTerrains(cellCount, mysteryCount) {
  const mysteryIndexes = new Set(shuffle([...Array(cellCount).keys()]).slice(0, mysteryCount))

  const terrainCount = cellCount - mysteryCount
  const terrainPool = []
  for (let i = 0; i < terrainCount; i++) {
    terrainPool.push(TERRAIN_TYPES[i % TERRAIN_TYPES.length])
  }
  const shuffledTerrain = shuffle(terrainPool)

  const terrains = []
  let terrainCursor = 0
  for (let index = 0; index < cellCount; index++) {
    if (mysteryIndexes.has(index)) {
      terrains.push('mystery')
    } else {
      terrains.push(shuffledTerrain[terrainCursor])
      terrainCursor++
    }
  }
  return terrains
}

export function createBoard() {
  const cells = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      cells.push({ row, col, city: null, terrain: null })
    }
  }

  const cpuCityIndex = cells.findIndex((cell) => cell.row === 0 && cell.col === 0)
  const playerCityIndex = cells.findIndex(
    (cell) => cell.row === BOARD_SIZE - 1 && cell.col === BOARD_SIZE - 1,
  )
  const cityIndexes = new Set([cpuCityIndex, playerCityIndex])

  const nonCityIndexes = cells.map((_, index) => index).filter((index) => !cityIndexes.has(index))
  const terrains = assignTerrains(nonCityIndexes.length, MYSTERY_COUNT)
  nonCityIndexes.forEach((cellIndex, i) => {
    cells[cellIndex].terrain = terrains[i]
  })

  cells[cpuCityIndex].city = 'cpu'
  cells[playerCityIndex].city = 'player'

  return { size: BOARD_SIZE, cells }
}

function renderWorkerBadge(worker, selectedWorkerId) {
  const style = OWNER_STYLES[worker.owner]
  const isSelected = worker.id === selectedWorkerId
  const selection = isSelected ? 'scale-110 ring-2 ring-sky-500' : ''
  const stayBadge =
    worker.turnsAtPosition > 1
      ? `<span class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-[10px] font-bold leading-none text-white sm:h-5 sm:w-5 sm:text-xs">${worker.turnsAtPosition}</span>`
      : ''

  return `
    <button
      type="button"
      data-worker-id="${worker.id}"
      title="${worker.owner === 'player' ? '自軍の労働者' : 'CPUの労働者'}（滞在${worker.turnsAtPosition}ターン目）"
      class="relative flex h-8 w-8 items-center justify-center rounded-full text-base shadow sm:h-10 sm:w-10 sm:text-xl ${style.bg} ${style.ring} ${selection}"
    >${style.emoji}${stayBadge}</button>
  `
}

function renderCell(cell, { workersAtCell, selectedWorkerId, isValidMove }) {
  const cityStyle = cell.city ? CITY_STYLES[cell.city] : null
  const terrainMeta = cell.terrain ? TERRAIN_META[cell.terrain] : null
  const tone = cityStyle ? CITY_TONE : terrainMeta.tone
  const ring = cityStyle ? cityStyle.ring : ''
  const highlight = isValidMove ? 'ring-4 ring-inset ring-sky-500 animate-pulse' : ''

  const mainMarkup = cityStyle
    ? `<span class="text-3xl drop-shadow sm:text-4xl" title="${cityStyle.label}">${cityStyle.emoji}</span>`
    : `<span class="text-xl sm:text-2xl" title="${terrainMeta.label}">${terrainMeta.emoji}</span>`

  const workersMarkup = workersAtCell.length
    ? `
      <div class="absolute inset-x-0 top-0 flex justify-center gap-1 p-0.5">
        ${workersAtCell.map((worker) => renderWorkerBadge(worker, selectedWorkerId)).join('')}
      </div>
    `
    : ''

  const highlightOverlay = isValidMove
    ? '<div class="pointer-events-none absolute inset-0 rounded-md bg-sky-400/40"></div>'
    : ''

  return `
    <div
      class="relative aspect-square flex items-center justify-center rounded-md border border-green-400/50 ${tone} ${ring} ${highlight}"
      data-row="${cell.row}"
      data-col="${cell.col}"
      data-terrain="${cell.terrain ?? 'city'}"
    >${highlightOverlay}${mainMarkup}${workersMarkup}</div>
  `
}

export function renderBoard(board, { workers = [], selectedWorkerId = null, validMoves = [] } = {}) {
  return `
    <div class="mx-auto grid w-[clamp(320px,90vw,580px)] grid-cols-5 gap-1.5">
      ${board.cells
        .map((cell) =>
          renderCell(cell, {
            workersAtCell: getWorkersAt(workers, cell.row, cell.col),
            selectedWorkerId,
            isValidMove: validMoves.some((pos) => pos.row === cell.row && pos.col === cell.col),
          }),
        )
        .join('')}
    </div>
  `
}
