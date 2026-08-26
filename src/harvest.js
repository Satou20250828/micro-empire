// 労働者1体が、地形マス（食料/生産力/金）に1ターンいることで得られる資源量。
// テックツリー（Issue #5）の産出強化はこの基礎値に加算される想定。
const HARVEST_AMOUNT = 1

// 各労働者が現在いるマスの地形に応じて資源を集計する。
// 都市マス（terrainがnull）と？マス（Issue #14で対応予定）にいる労働者からは何も得られない。
export function harvestResources(board, workers) {
  const totals = {
    player: { food: 0, production: 0, gold: 0 },
    cpu: { food: 0, production: 0, gold: 0 },
  }

  workers.forEach((worker) => {
    const cell = board.cells.find((c) => c.row === worker.row && c.col === worker.col)
    if (!cell || !cell.terrain || cell.terrain === 'mystery') return

    totals[worker.owner][cell.terrain] += HARVEST_AMOUNT
  })

  return totals
}
