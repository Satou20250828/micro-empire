export function createTurnState() {
  return { turn: 1 }
}

export function advanceTurn(turnState) {
  turnState.turn += 1
  return turnState
}

export function renderTurnCounter(turnState) {
  return `
    <span class="text-sm text-stone-600">
      ターン <span class="font-semibold text-stone-800">${turnState.turn}</span>
    </span>
  `
}

export function renderTurnButton() {
  return `
    <button
      id="next-turn"
      type="button"
      class="fixed bottom-4 right-4 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-amber-600 active:bg-amber-700"
    >
      ターンを進める ▶
    </button>
  `
}
