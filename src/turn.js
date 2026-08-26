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
    <div class="group relative inline-flex">
      <button
        id="next-turn"
        type="button"
        class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-base text-white shadow transition-colors hover:bg-amber-600 active:bg-amber-700"
      >
        ▶
      </button>
      <span
        class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100"
      >
        ターンを進める
      </span>
    </div>
  `
}
