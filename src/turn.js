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
      class="group fixed bottom-4 right-4 flex h-14 items-center overflow-hidden rounded-full bg-amber-500 text-white shadow-lg transition-colors hover:bg-amber-600 active:bg-amber-700"
    >
      <span class="max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-semibold opacity-0 transition-all duration-300 ease-out group-hover:max-w-[10rem] group-hover:pl-4 group-hover:opacity-100">
        ターンを進める
      </span>
      <span class="flex h-14 w-14 flex-shrink-0 items-center justify-center text-2xl">▶</span>
    </button>
  `
}
