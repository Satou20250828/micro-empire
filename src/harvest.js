import { getProductionBonus } from './techtree.js'

// 労働者1体が、地形マス（食料/生産力/金）に1ターンいることで得られる基礎資源量。
// テックツリー（Issue #5）の1〜3段階目の産出ボーナスはこの基礎値に加算される。
const HARVEST_AMOUNT = 1

// 各労働者が現在いるマスの地形に応じて資源を集計する。techStatesは{ player, cpu }形式の
// テック解放状況（省略時はボーナスなしとして扱う）。都市マス（terrainがnull）と？マス
// （Issue #14で対応済み、こちらのロジックはmystery.jsが担当）にいる労働者からは得られない。
export function harvestResources(board, workers, techStates) {
  const totals = {
    player: { food: 0, production: 0, gold: 0 },
    cpu: { food: 0, production: 0, gold: 0 },
  }

  workers.forEach((worker) => {
    const cell = board.cells.find((c) => c.row === worker.row && c.col === worker.col)
    if (!cell || !cell.terrain || cell.terrain === 'mystery') return

    const techState = techStates?.[worker.owner]
    const bonus = techState ? getProductionBonus(techState, cell.terrain) : 0
    totals[worker.owner][cell.terrain] += HARVEST_AMOUNT + bonus
  })

  return totals
}
