const BOARD_SIZE = 5
const MYSTERY_COUNT = 3

const CITY_STYLES = {
  player: { emoji: '🏰', ring: 'ring-4 ring-amber-400', label: '自都市' },
  cpu: { emoji: '🏯', ring: 'ring-4 ring-rose-400', label: 'CPU都市' },
}

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

// 22マス分の地形をなるべく均等（食料/生産力/金がおよそ7〜8マスずつ）に配りつつ、
// どのマスがどの地形になるかはシャッフルでランダムに決める。
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

  const terrains = assignTerrains(cells.length, MYSTERY_COUNT)
  cells.forEach((cell, index) => {
    cell.terrain = terrains[index]
  })

  const cpuCity = cells.find((cell) => cell.row === 0 && cell.col === 0)
  cpuCity.city = 'cpu'

  const playerCity = cells.find(
    (cell) => cell.row === BOARD_SIZE - 1 && cell.col === BOARD_SIZE - 1,
  )
  playerCity.city = 'player'

  return { size: BOARD_SIZE, cells }
}

function renderCell(cell) {
  const cityStyle = cell.city ? CITY_STYLES[cell.city] : null
  const terrainMeta = TERRAIN_META[cell.terrain]
  const ring = cityStyle ? cityStyle.ring : ''

  const mainMarkup = cityStyle
    ? `<span class="text-4xl drop-shadow sm:text-5xl" title="${cityStyle.label}">${cityStyle.emoji}</span>`
    : `<span class="text-2xl sm:text-3xl" title="${terrainMeta.label}">${terrainMeta.emoji}</span>`

  const terrainBadge = cityStyle
    ? `<span class="absolute bottom-0.5 right-0.5 text-xs sm:text-sm" title="${terrainMeta.label}">${terrainMeta.emoji}</span>`
    : ''

  return `
    <div
      class="relative aspect-square flex items-center justify-center rounded-md border border-green-400/50 ${terrainMeta.tone} ${ring}"
      data-row="${cell.row}"
      data-col="${cell.col}"
      data-terrain="${cell.terrain}"
    >${mainMarkup}${terrainBadge}</div>
  `
}

export function renderBoard(board) {
  return `
    <div class="mx-auto grid w-[clamp(280px,80vw,580px)] grid-cols-5 gap-1.5">
      ${board.cells.map(renderCell).join('')}
    </div>
  `
}
