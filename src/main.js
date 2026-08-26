import './style.css'
import { createBoard, renderBoard } from './board.js'
import { createResources, renderResources, addResources } from './resources.js'
import { createTurnState, advanceTurn, renderTurnCounter, renderTurnButton } from './turn.js'
import { renderPanelButtons } from './panels.js'

const TURN_YIELD = { food: 2, production: 1, gold: 1 }

const board = createBoard()
const resources = createResources()
const turnState = createTurnState()

const app = document.querySelector('#app')

function render() {
  app.innerHTML = `
    <main class="relative flex min-h-screen flex-col items-center gap-6 bg-amber-50 p-4 pb-24 text-stone-800">
      <header class="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-amber-600 sm:text-3xl">🏛️ 小さな帝国</h1>
        <div class="flex flex-wrap items-center gap-3">
          ${renderResources(resources)}
          ${renderTurnCounter(turnState)}
          ${renderPanelButtons()}
        </div>
      </header>

      <div class="flex flex-1 flex-col items-center justify-center gap-4">
        ${renderBoard(board)}
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-stone-600">
          <span>🏰 自都市</span>
          <span>🏯 CPU都市</span>
          <span>🌾 食料</span>
          <span>⚙️ 生産力</span>
          <span>💰 金</span>
          <span>❓ ？マス</span>
        </div>
      </div>

      ${renderTurnButton()}
    </main>
  `
}

render()

app.addEventListener('click', (event) => {
  if (!event.target.closest('#next-turn')) return

  advanceTurn(turnState)
  addResources(resources, TURN_YIELD)
  render()
})
