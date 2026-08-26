import { TECH_LINES, LINE_KEYS } from './techtree.js'
import { renderResources } from './resources.js'

// テックツリーモーダル（techtree.js）と見せ方は揃えつつ、解放操作はできない閲覧専用の表示。
function renderReadOnlyTechCard(tech, tierIndex, techState, lineKey) {
  const tierNumber = tierIndex + 1
  const isUnlocked = tierNumber <= techState[lineKey]
  const statusLabel = isUnlocked ? '解放済み' : '未解放'
  const effectLabel = tech.bonus ? `産出+${tech.bonus}` : `${tech.note}（今後実装予定）`
  const tone = isUnlocked ? 'border-emerald-400 bg-emerald-50' : 'border-stone-300 bg-stone-100 opacity-70'

  return `
    <div class="rounded border ${tone} p-2 text-xs">
      <div class="font-semibold">${tierNumber}. ${tech.name}</div>
      <div class="text-stone-600">${effectLabel}</div>
      <div class="text-[10px] text-stone-500">${statusLabel}</div>
    </div>
  `
}

function renderLineColumn(lineKey, techState) {
  const line = TECH_LINES[lineKey]
  return `
    <div class="flex flex-1 flex-col gap-2">
      <div class="text-center text-sm font-bold">${line.emoji} ${line.label}</div>
      ${line.techs.map((tech, index) => renderReadOnlyTechCard(tech, index, techState, lineKey)).join('')}
    </div>
  `
}

export function renderCpuStatusModal(cpuResources, cpuTechState) {
  return `
    <div id="cpu-status-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-800">🤖 CPU都市の状況</h2>
          <button type="button" id="close-cpu-status" class="rounded-full px-2 py-1 text-stone-500 hover:bg-stone-100">✕</button>
        </div>
        <div class="mb-4 flex justify-center">
          ${renderResources(cpuResources)}
        </div>
        <div class="flex gap-3">
          ${LINE_KEYS.map((lineKey) => renderLineColumn(lineKey, cpuTechState)).join('')}
        </div>
      </div>
    </div>
  `
}
