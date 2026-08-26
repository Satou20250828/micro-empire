import './style.css'
import { createBoard, renderBoard } from './board.js'
import { createResources, renderResources, addResources } from './resources.js'
import { createTurnState, advanceTurn, renderTurnCounter, renderTurnButton } from './turn.js'
import { renderPanelButtons } from './panels.js'
import { createWorkers, getValidMoves, canMoveWorker, moveWorker, advanceWorkerTurns } from './workers.js'
import { harvestResources } from './harvest.js'
import { applyMysteryEffects, renderMysteryEvents } from './mystery.js'
import { createTechState, unlockNextTech, renderTechTreeModal } from './techtree.js'
import { renderCpuStatusModal } from './cpuStatus.js'

const board = createBoard()
const resources = createResources()
const cpuResources = createResources()
const turnState = createTurnState()
const workers = createWorkers(board)
const playerTech = createTechState()
const cpuTech = createTechState()

let selectedWorkerId = null
let lastMysteryEvents = []
let isTechTreeOpen = false
let isCpuStatusOpen = false

const app = document.querySelector('#app')

function getSelectedWorker() {
  return workers.find((worker) => worker.id === selectedWorkerId) ?? null
}

function render() {
  const selectedWorker = getSelectedWorker()
  const validMoves = selectedWorker ? getValidMoves(workers, selectedWorker, board.size) : []

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
        ${renderBoard(board, { workers, selectedWorkerId, validMoves })}
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-stone-600">
          <span>🏰 自都市</span>
          <span>🏯 CPU都市</span>
          <span>🌾 食料</span>
          <span>⚙️ 生産力</span>
          <span>💰 金</span>
          <span>❓ ？マス</span>
          <span>🧑‍🌾 労働者（数字は同じマスに滞在中のターン数）</span>
        </div>
        ${renderMysteryEvents(lastMysteryEvents)}
      </div>

      ${renderTurnButton()}
      ${isTechTreeOpen ? renderTechTreeModal(playerTech) : ''}
      ${isCpuStatusOpen ? renderCpuStatusModal(cpuResources, cpuTech) : ''}
    </main>
  `
}

render()

app.addEventListener('click', (event) => {
  if (event.target.closest('#open-tech-tree')) {
    isCpuStatusOpen = false
    isTechTreeOpen = true
    render()
    return
  }

  if (event.target.closest('#open-cpu-status')) {
    isTechTreeOpen = false
    isCpuStatusOpen = true
    render()
    return
  }

  if (isTechTreeOpen) {
    if (event.target.closest('#close-tech-tree') || event.target.id === 'tech-tree-modal') {
      isTechTreeOpen = false
      render()
      return
    }

    const unlockButton = event.target.closest('[data-unlock-line]')
    if (unlockButton) {
      unlockNextTech(playerTech, resources, unlockButton.dataset.unlockLine)
      render()
    }
    return
  }

  if (isCpuStatusOpen) {
    if (event.target.closest('#close-cpu-status') || event.target.id === 'cpu-status-modal') {
      isCpuStatusOpen = false
      render()
    }
    return
  }

  if (event.target.closest('#next-turn')) {
    const harvest = harvestResources(board, workers, { player: playerTech, cpu: cpuTech })
    addResources(resources, harvest.player)
    addResources(cpuResources, harvest.cpu)
    lastMysteryEvents = applyMysteryEffects(board, workers, { player: resources, cpu: cpuResources })
    advanceWorkerTurns(workers, board.size)
    advanceTurn(turnState)
    selectedWorkerId = null
    render()
    return
  }

  const workerButton = event.target.closest('[data-worker-id]')
  if (workerButton) {
    const clickedId = workerButton.dataset.workerId
    const clickedWorker = workers.find((worker) => worker.id === clickedId)
    if (!clickedWorker || clickedWorker.owner !== 'player') return

    selectedWorkerId = selectedWorkerId === clickedId ? null : clickedId
    render()
    return
  }

  const cell = event.target.closest('[data-row]')
  const selectedWorker = getSelectedWorker()
  if (cell && selectedWorker) {
    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)
    if (canMoveWorker(workers, selectedWorker, row, col, board.size)) {
      moveWorker(selectedWorker, row, col)
      selectedWorkerId = null
      render()
      return
    }
  }

  selectedWorkerId = null
  render()
})
