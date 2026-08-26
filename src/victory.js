// 勝利条件（OR）：①テックツリー全15技術（3系統×5段階）を解放する／②食料・生産力・金の
// 合計がしきい値に到達する。しきい値は、テックツリーを全解放するのに必要な資源合計（1系統
// あたり10+20+35+55+80=200、3系統で600）よりだいぶ早く到達できる水準として150とした。
export const RESOURCE_VICTORY_THRESHOLD = 150
const REQUIRED_TIER_PER_LINE = 5

function hasUnlockedAllTechs(techState) {
  return Object.values(techState).every((tier) => tier >= REQUIRED_TIER_PER_LINE)
}

function getResourceTotal(resources) {
  return resources.food + resources.production + resources.gold
}

// 条件を満たしていれば勝因（'tech' | 'resource'）を返し、満たしていなければnullを返す。
export function checkVictory(resources, techState) {
  if (hasUnlockedAllTechs(techState)) return 'tech'
  if (getResourceTotal(resources) >= RESOURCE_VICTORY_THRESHOLD) return 'resource'
  return null
}

// 自都市・CPU都市どちらが勝利条件を満たしたかを判定する。同じターンで両者が同時に
// 条件を満たした場合はプレイヤー優先とする（暫定仕様）。
export function determineWinner({ playerResources, playerTech, cpuResources, cpuTech }) {
  const playerReason = checkVictory(playerResources, playerTech)
  const cpuReason = checkVictory(cpuResources, cpuTech)

  if (playerReason) return { winner: 'player', reason: playerReason }
  if (cpuReason) return { winner: 'cpu', reason: cpuReason }
  return null
}

const REASON_LABEL = {
  tech: 'テックツリー全15技術を解放した',
  resource: `資源合計が${RESOURCE_VICTORY_THRESHOLD}に到達した`,
}

const WINNER_LABEL = { player: '自軍', cpu: 'CPU' }

export function renderVictoryModal(result) {
  return `
    <div id="victory-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div class="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
        <div class="mb-2 text-4xl">${result.winner === 'player' ? '🎉' : '💻'}</div>
        <h2 class="mb-2 text-xl font-bold text-stone-800">${WINNER_LABEL[result.winner]}の勝利！</h2>
        <p class="mb-4 text-sm text-stone-600">勝因：${REASON_LABEL[result.reason]}</p>
        <div class="flex justify-center gap-2">
          <button
            type="button"
            id="retry-game"
            class="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            🔄 もう一度プレイ
          </button>
          <button
            type="button"
            id="close-victory"
            class="rounded bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  `
}
