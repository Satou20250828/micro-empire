import { RESOURCE_VICTORY_THRESHOLD } from './victory.js'

const SECTIONS = [
  {
    title: '🧑‍🌾 労働者の移動',
    items: [
      '自都市・CPU都市それぞれ2体の労働者からスタートし、毎ターン隣接マス（上下左右）へ1マス移動できる（動かさなくてもよい）',
      '相手陣営の労働者がいるマスへは移動できない（自陣営同士は重複可）',
      '同じマスに3ターン連続で滞在した労働者は、4ターン目に自動で別マスへ強制移動する',
    ],
  },
  {
    title: '🌾⚙️💰 資源収穫',
    items: [
      '労働者が今立っているマスの地形（食料/生産力/金）に応じて、毎ターン資源が加算される',
      '都市マスは中立で、資源は得られない',
      '？マスにいる労働者は、毎ターン「資源ボーナス／変化なし／資源ロス」がランダムに発生する',
    ],
  },
  {
    title: '🔬 テックツリー',
    items: [
      '🌾農業・⚙️建築・💰貨幣の3系統×5段階＝計15技術。各系統は前提条件でつながっており、順番にしか解放できない',
      '1〜3段階目は該当資源の産出量を強化する',
      '4〜5段階目は特殊効果（3ターン滞在制限の撤廃・労働者3体目の追加・1ターン2マス移動・？マスのマイナス効果消滅・勝利しきい値ダウン・解放コスト割引）',
    ],
  },
  {
    title: '🏁 勝利条件（いずれかを達成）',
    items: [
      'テックツリーの全15技術を解放する',
      `食料・生産力・金の合計が${RESOURCE_VICTORY_THRESHOLD}に到達する（「金融」を解放すると必要量が下がる）`,
    ],
  },
]

function renderSection(section) {
  return `
    <div class="mb-4 last:mb-0">
      <h3 class="mb-1 text-sm font-bold text-stone-800">${section.title}</h3>
      <ul class="list-disc space-y-1 pl-5 text-xs text-stone-600">
        ${section.items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `
}

export function renderRulesModal() {
  return `
    <div id="rules-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-800">📖 ゲームルール</h2>
          <button type="button" id="close-rules" class="rounded-full px-2 py-1 text-stone-500 hover:bg-stone-100">✕</button>
        </div>
        ${SECTIONS.map(renderSection).join('')}
      </div>
    </div>
  `
}
