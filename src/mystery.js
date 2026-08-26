const EFFECT_TABLE = [
  { type: 'bonus', weight: 50 },
  { type: 'nothing', weight: 30 },
  { type: 'loss', weight: 20 },
]

const RESOURCE_TYPES = ['food', 'production', 'gold']
const BONUS_AMOUNT = 2
const LOSS_AMOUNT = 1

const RESOURCE_EMOJI = { food: '🌾', production: '⚙️', gold: '💰' }
const OWNER_LABEL = { player: '🏰自軍', cpu: '🏯CPU' }

function pickWeightedType() {
  const total = EFFECT_TABLE.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * total
  for (const entry of EFFECT_TABLE) {
    if (roll < entry.weight) return entry.type
    roll -= entry.weight
  }
  return EFFECT_TABLE[EFFECT_TABLE.length - 1].type
}

function pickResourceType() {
  return RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)]
}

export function rollMysteryEffect() {
  const type = pickWeightedType()
  if (type === 'nothing') {
    return { type, resource: null, amount: 0 }
  }

  const resource = pickResourceType()
  const amount = type === 'bonus' ? BONUS_AMOUNT : -LOSS_AMOUNT
  return { type, resource, amount }
}

// 盤面上の？マスにいる各労働者について効果を抽選し、所属陣営の資源プールへ反映する。
// 資源はマイナスにならないようクランプする。画面表示用に発生イベントの一覧を返す。
export function applyMysteryEffects(board, workers, resourcePools) {
  const events = []

  workers.forEach((worker) => {
    const cell = board.cells.find((c) => c.row === worker.row && c.col === worker.col)
    if (!cell || cell.terrain !== 'mystery') return

    const effect = rollMysteryEffect()
    if (effect.type !== 'nothing') {
      const pool = resourcePools[worker.owner]
      pool[effect.resource] = Math.max(0, pool[effect.resource] + effect.amount)
    }

    events.push({ workerId: worker.id, owner: worker.owner, ...effect })
  })

  return events
}

function renderEvent(event) {
  const ownerLabel = OWNER_LABEL[event.owner]

  if (event.type === 'nothing') {
    return `<span class="rounded-full bg-slate-200 px-3 py-1">❓ ${ownerLabel}：変化なし</span>`
  }

  const emoji = RESOURCE_EMOJI[event.resource]
  const sign = event.amount > 0 ? '+' : ''
  const tone = event.type === 'bonus' ? 'bg-emerald-200' : 'bg-rose-200'
  return `<span class="rounded-full ${tone} px-3 py-1">❓ ${ownerLabel}：${sign}${event.amount}${emoji}</span>`
}

export function renderMysteryEvents(events) {
  if (!events.length) return ''

  return `
    <div class="flex flex-wrap justify-center gap-2 text-sm text-stone-700">
      ${events.map(renderEvent).join('')}
    </div>
  `
}
