import './style.css'
import { createBoard, renderBoard } from './board.js'
import { createResources, renderResources, addResources } from './resources.js'
import { createTurnState, advanceTurn, renderTurnCounter, renderTurnButton } from './turn.js'
import { renderPanelButtons } from './panels.js'
import {
  createWorkers,
  addWorker,
  getValidMoves,
  canMoveWorker,
  moveWorker,
  advanceWorkerTurns,
} from './workers.js'
import { harvestResources } from './harvest.js'
import { applyMysteryEffects, renderMysteryEvents } from './mystery.js'
import { createTechState, unlockNextTech, renderTechTreeModal } from './techtree.js'
import { renderCpuStatusModal } from './cpuStatus.js'
import { runCpuTurn } from './cpuAi.js'
import { determineWinner, renderVictoryModal, renderDifficultySelector, DEFAULT_DIFFICULTY } from './victory.js'
import { renderRulesModal } from './rules.js'

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
let isRulesOpen = false
let gameResult = null
let isVictoryModalOpen = false
let difficulty = DEFAULT_DIFFICULTY

const app = document.querySelector('#app')

const ARCHITECTURE_MACHINERY_TIER = 4
const ARCHITECTURE_INDUSTRIALIZATION_TIER = 5
const AGRICULTURE_FALLOW_LIMIT_TIER = 4
const AGRICULTURE_REVOLUTION_TIER = 5

function getSelectedWorker() {
  return workers.find((worker) => worker.id === selectedWorkerId) ?? null
}

function getPlayerMoveLimit() {
  return playerTech.architecture >= ARCHITECTURE_MACHINERY_TIER ? 2 : 1
}

function getStayLimitExemptOwners() {
  const exempt = []
  if (playerTech.agriculture >= AGRICULTURE_FALLOW_LIMIT_TIER) exempt.push('player')
  if (cpuTech.agriculture >= AGRICULTURE_FALLOW_LIMIT_TIER) exempt.push('cpu')
  return exempt
}

function getMysteryLossExemptOwners() {
  const exempt = []
  if (playerTech.architecture >= ARCHITECTURE_INDUSTRIALIZATION_TIER) exempt.push('player')
  if (cpuTech.architecture >= ARCHITECTURE_INDUSTRIALIZATION_TIER) exempt.push('cpu')
  return exempt
}

function render() {
  const selectedWorker = getSelectedWorker()
  const validMoves = selectedWorker
    ? getValidMoves(workers, selectedWorker, board.size, getPlayerMoveLimit())
    : []

  app.innerHTML = `
    <main class="relative flex min-h-screen flex-col items-center gap-6 bg-amber-50 p-4 pb-24 text-stone-800">
      <header class="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-amber-600 sm:text-3xl">🏛️ 小さな帝国</h1>
        <div class="flex flex-wrap items-center gap-3">
          ${renderResources(resources)}
          ${renderTurnCounter(turnState)}
          ${renderDifficultySelector(difficulty, Boolean(gameResult))}
          ${renderPanelButtons()}
          ${gameResult ? '<span class="rounded-full bg-stone-800 px-3 py-1 text-xs font-semibold text-white">🏁 ゲーム終了</span>' : ''}
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

      ${gameResult ? '' : renderTurnButton()}
      ${isTechTreeOpen ? renderTechTreeModal(playerTech) : ''}
      ${isCpuStatusOpen ? renderCpuStatusModal(cpuResources, cpuTech) : ''}
      ${isVictoryModalOpen ? renderVictoryModal(gameResult) : ''}
      ${isRulesOpen ? renderRulesModal(difficulty) : ''}
    </main>
  `
}

render()

app.addEventListener('change', (event) => {
  if (event.target.id === 'difficulty-select') {
    difficulty = event.target.value
  }
})

app.addEventListener('click', (event) => {
  if (event.target.closest('#reset-game')) {
    window.location.reload()
    return
  }

  if (gameResult) {
    if (event.target.closest('#retry-game')) {
      window.location.reload()
      return
    }
    if (event.target.closest('#close-victory') || event.target.id === 'victory-modal') {
      isVictoryModalOpen = false
      render()
    }
    return
  }

  if (event.target.closest('#open-tech-tree')) {
    isCpuStatusOpen = false
    isRulesOpen = false
    isTechTreeOpen = true
    render()
    return
  }

  if (event.target.closest('#open-cpu-status')) {
    isTechTreeOpen = false
    isRulesOpen = false
    isCpuStatusOpen = true
    render()
    return
  }

  if (event.target.closest('#open-rules')) {
    isTechTreeOpen = false
    isCpuStatusOpen = false
    isRulesOpen = true
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
      const lineKey = unlockButton.dataset.unlockLine
      const beforeTier = playerTech[lineKey]
      const unlocked = unlockNextTech(playerTech, resources, lineKey)
      if (
        unlocked &&
        lineKey === 'agriculture' &&
        beforeTier === AGRICULTURE_REVOLUTION_TIER - 1 &&
        playerTech.agriculture === AGRICULTURE_REVOLUTION_TIER
      ) {
        addWorker(workers, board, 'player')
      }
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

  if (isRulesOpen) {
    if (event.target.closest('#close-rules') || event.target.id === 'rules-modal') {
      isRulesOpen = false
      render()
    }
    return
  }

  if (event.target.closest('#next-turn')) {
    runCpuTurn(board, workers, cpuResources, cpuTech)
    const harvest = harvestResources(board, workers, { player: playerTech, cpu: cpuTech })
    addResources(resources, harvest.player)
    addResources(cpuResources, harvest.cpu)
    lastMysteryEvents = applyMysteryEffects(
      board,
      workers,
      { player: resources, cpu: cpuResources },
      getMysteryLossExemptOwners(),
    )
    advanceWorkerTurns(workers, board.size, getStayLimitExemptOwners())
    advanceTurn(turnState)
    gameResult = determineWinner({
      playerResources: resources,
      playerTech,
      cpuResources,
      cpuTech,
      difficulty,
    })
    if (gameResult) isVictoryModalOpen = true
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
    const moveLimit = getPlayerMoveLimit()
    if (canMoveWorker(workers, selectedWorker, row, col, board.size, moveLimit)) {
      moveWorker(selectedWorker, row, col)
      // 機械工学解放後は1ターンに2マス移動できるため、移動回数が残っていれば選択状態を維持する
      if (selectedWorker.movedThisTurn >= moveLimit) {
        selectedWorkerId = null
      }
      render()
      return
    }
  }

  selectedWorkerId = null
  render()
})
