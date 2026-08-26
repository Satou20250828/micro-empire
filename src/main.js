import './style.css'
import { createBoard, renderBoard } from './board.js'
import { createResources, renderResources } from './resources.js'

const board = createBoard()
const resources = createResources()

document.querySelector('#app').innerHTML = `
  <main class="flex min-h-screen flex-col items-center justify-center gap-6 bg-amber-50 p-4 text-stone-800">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-amber-600">🏛️ micro-empire</h1>
      <p class="mt-1 text-stone-500">超ミニ4X — 盤面表示</p>
    </div>
    ${renderResources(resources)}
    ${renderBoard(board)}
    <div class="flex gap-4 text-sm text-stone-600">
      <span>🏰 自都市</span>
      <span>🏯 CPU都市</span>
    </div>
  </main>
`
