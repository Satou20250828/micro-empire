const BOARD_SIZE = 5

const CITY_STYLES = {
  player: { emoji: '🏰', ring: 'ring-4 ring-amber-400', label: '自都市' },
  cpu: { emoji: '🏯', ring: 'ring-4 ring-rose-400', label: 'CPU都市' },
}

const TERRAIN_TONES = ['bg-green-200', 'bg-green-300']

export function createBoard() {
  const cells = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      cells.push({ row, col, city: null })
    }
  }

  const cpuCity = cells.find((cell) => cell.row === 0 && cell.col === 0)
  cpuCity.city = 'cpu'

  const playerCity = cells.find(
    (cell) => cell.row === BOARD_SIZE - 1 && cell.col === BOARD_SIZE - 1,
  )
  playerCity.city = 'player'

  return { size: BOARD_SIZE, cells }
}

function renderCell(cell) {
  const style = cell.city ? CITY_STYLES[cell.city] : null
  const cityMarkup = style
    ? `<span class="text-4xl drop-shadow sm:text-5xl" title="${style.label}">${style.emoji}</span>`
    : ''
  const ring = style ? style.ring : ''
  const terrain = TERRAIN_TONES[(cell.row + cell.col) % 2]

  return `
    <div
      class="aspect-square flex items-center justify-center rounded-md border border-green-400/50 ${terrain} ${ring}"
      data-row="${cell.row}"
      data-col="${cell.col}"
    >${cityMarkup}</div>
  `
}

export function renderBoard(board) {
  return `
    <div class="mx-auto grid w-[clamp(280px,80vw,580px)] grid-cols-5 gap-1.5">
      ${board.cells.map(renderCell).join('')}
    </div>
  `
}
