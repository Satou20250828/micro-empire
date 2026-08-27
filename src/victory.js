// 勝利条件（OR）：①テックツリー全15技術（3系統×5段階）を解放する／②食料・生産力・金の
// 合計が難易度ごとのしきい値に到達する。しきい値は、テックツリーを全解放するのに必要な
// 資源合計（1系統あたり10+20+35+55+80=200、3系統で600）よりだいぶ早く到達できる水準を
// 基準に、簡単・普通・難しいの3段階を用意した（2026-08-26、社長のフィードバックで追加）。
export const DIFFICULTY_LEVELS = {
  easy: { label: '簡単', threshold: 80 },
  normal: { label: '普通', threshold: 115 },
  hard: { label: '難しい', threshold: 150 },
}
export const DEFAULT_DIFFICULTY = 'normal'

const REQUIRED_TIER_PER_LINE = 5
const FINANCE_TIER = 4
const FINANCE_DISCOUNT_RATE = 0.2

function hasUnlockedAllTechs(techState) {
  return Object.values(techState).every((tier) => tier >= REQUIRED_TIER_PER_LINE)
}

function getResourceTotal(resources) {
  return resources.food + resources.production + resources.gold
}

// 「金融」（貨幣ライン4段階目）を解放した陣営は、資源到達による勝利のしきい値が
// 難易度の基準値からさらに20%下がる（Issue #22）。
export function getResourceThreshold(techState, difficulty = DEFAULT_DIFFICULTY) {
  const baseThreshold = DIFFICULTY_LEVELS[difficulty].threshold
  return techState.currency >= FINANCE_TIER
    ? Math.round(baseThreshold * (1 - FINANCE_DISCOUNT_RATE))
    : baseThreshold
}

// 条件を満たしていれば勝因（'tech' | 'resource'）を返し、満たしていなければnullを返す。
export function checkVictory(resources, techState, difficulty = DEFAULT_DIFFICULTY) {
  if (hasUnlockedAllTechs(techState)) return 'tech'
  if (getResourceTotal(resources) >= getResourceThreshold(techState, difficulty)) return 'resource'
  return null
}

// 自都市・CPU都市どちらが勝利条件を満たしたかを判定する。同じターンで両者が同時に
// 条件を満たした場合はプレイヤー優先とする（暫定仕様）。
export function determineWinner({
  playerResources,
  playerTech,
  cpuResources,
  cpuTech,
  difficulty = DEFAULT_DIFFICULTY,
}) {
  const playerReason = checkVictory(playerResources, playerTech, difficulty)
  const cpuReason = checkVictory(cpuResources, cpuTech, difficulty)

  if (playerReason) return { winner: 'player', reason: playerReason }
  if (cpuReason) return { winner: 'cpu', reason: cpuReason }
  return null
}

const REASON_LABEL = {
  tech: 'テックツリー全15技術を解放した',
  resource: '資源合計がしきい値に到達した',
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

export function renderDifficultySelector(currentDifficulty, disabled) {
  const options = Object.entries(DIFFICULTY_LEVELS)
    .map(
      ([key, level]) =>
        `<option value="${key}" ${key === currentDifficulty ? 'selected' : ''}>${level.label}（${level.threshold}）</option>`,
    )
    .join('')

  return `
    <select
      id="difficulty-select"
      title="資源到達による勝利のしきい値"
      class="rounded-full border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700"
      ${disabled ? 'disabled' : ''}
    >
      ${options}
    </select>
  `
}
