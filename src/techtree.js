// 3系統×5段階＝計15技術。各系統は前提条件でつながった一直線（配列の順番どおりにしか解放できない）。
// 4〜5段階目の特殊効果（居座り制限撤廃・2マス移動・労働者3体目・？マスリスク消滅・コスト割引・
// 勝利条件しきい値）はIssue #22で対応するため、ここでは`note`として説明のみ持たせる。
export const TECH_LINES = {
  agriculture: {
    label: '農業',
    emoji: '🌾',
    resource: 'food',
    techs: [
      { name: '農耕', cost: 10, bonus: 1 },
      { name: '灌漑', cost: 20, bonus: 2 },
      { name: '肥料', cost: 35, bonus: 3 },
      { name: '品種改良', cost: 55, note: '3ターン滞在制限の撤廃' },
      { name: '農業革命', cost: 80, note: '労働者が3体目に増える' },
    ],
  },
  architecture: {
    label: '建築',
    emoji: '⚙️',
    resource: 'production',
    techs: [
      { name: '建築基礎', cost: 10, bonus: 1 },
      { name: '石工術', cost: 20, bonus: 2 },
      { name: '土木工学', cost: 35, bonus: 3 },
      { name: '機械工学', cost: 55, note: '労働者が1ターンに2マス移動可能に' },
      { name: '産業化', cost: 80, note: '？マスのマイナス効果が発生しなくなる' },
    ],
  },
  currency: {
    label: '貨幣',
    emoji: '💰',
    resource: 'gold',
    techs: [
      { name: '貨幣鋳造', cost: 10, bonus: 1 },
      { name: '交易', cost: 20, bonus: 2 },
      { name: '銀行', cost: 35, bonus: 3 },
      { name: '金融', cost: 55, note: '勝利条件のしきい値が下がる' },
      { name: '資本主義', cost: 80, note: '農業/建築ラインの解放コストが20%引きになる' },
    ],
  },
}

export const LINE_KEYS = Object.keys(TECH_LINES)

const RESOURCE_TO_LINE = Object.fromEntries(
  LINE_KEYS.map((lineKey) => [TECH_LINES[lineKey].resource, lineKey]),
)

export function createTechState() {
  return { agriculture: 0, architecture: 0, currency: 0 }
}

export function getNextTech(techState, lineKey) {
  const line = TECH_LINES[lineKey]
  const unlockedCount = techState[lineKey]
  if (unlockedCount >= line.techs.length) return null
  return line.techs[unlockedCount]
}

export function canUnlockNext(techState, resources, lineKey) {
  const nextTech = getNextTech(techState, lineKey)
  if (!nextTech) return false
  const line = TECH_LINES[lineKey]
  return resources[line.resource] >= nextTech.cost
}

export function unlockNextTech(techState, resources, lineKey) {
  if (!canUnlockNext(techState, resources, lineKey)) return false

  const line = TECH_LINES[lineKey]
  const nextTech = getNextTech(techState, lineKey)
  resources[line.resource] -= nextTech.cost
  techState[lineKey] += 1
  return true
}

// 1〜3段階目の産出ボーナス。4〜5段階目を解放していても数値ボーナスは3で頭打ち
// （4〜5段階目の効果自体はIssue #22で別途実装する）。
export function getProductionBonus(techState, resourceType) {
  const lineKey = RESOURCE_TO_LINE[resourceType]
  if (!lineKey) return 0
  return Math.min(techState[lineKey], 3)
}

function renderTechCard(lineKey, tech, tierIndex, techState) {
  const tierNumber = tierIndex + 1
  const unlockedCount = techState[lineKey]
  const isUnlocked = tierNumber <= unlockedCount
  const isNext = tierNumber === unlockedCount + 1

  const statusLabel = isUnlocked ? '解放済み' : isNext ? '解放可能' : '未解放'
  const effectLabel = tech.bonus ? `産出+${tech.bonus}` : `${tech.note}（今後実装予定）`
  const tone = isUnlocked
    ? 'border-emerald-400 bg-emerald-50'
    : isNext
      ? 'border-amber-400 bg-amber-50'
      : 'border-stone-300 bg-stone-100 opacity-70'

  const button = isNext
    ? `<button type="button" data-unlock-line="${lineKey}" class="mt-1 w-full rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600">解放する（${TECH_LINES[lineKey].resource === 'food' ? '🌾' : TECH_LINES[lineKey].resource === 'production' ? '⚙️' : '💰'}${tech.cost}）</button>`
    : ''

  return `
    <div class="rounded border ${tone} p-2 text-xs">
      <div class="font-semibold">${tierNumber}. ${tech.name}</div>
      <div class="text-stone-600">${effectLabel}</div>
      <div class="text-[10px] text-stone-500">${statusLabel}</div>
      ${button}
    </div>
  `
}

function renderLineColumn(lineKey, techState) {
  const line = TECH_LINES[lineKey]
  return `
    <div class="flex flex-1 flex-col gap-2">
      <div class="text-center text-sm font-bold">${line.emoji} ${line.label}</div>
      ${line.techs.map((tech, index) => renderTechCard(lineKey, tech, index, techState)).join('')}
    </div>
  `
}

export function renderTechTreeModal(techState) {
  return `
    <div id="tech-tree-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-800">🔬 テックツリー</h2>
          <button type="button" id="close-tech-tree" class="rounded-full px-2 py-1 text-stone-500 hover:bg-stone-100">✕</button>
        </div>
        <div class="flex gap-3">
          ${LINE_KEYS.map((lineKey) => renderLineColumn(lineKey, techState)).join('')}
        </div>
      </div>
    </div>
  `
}
