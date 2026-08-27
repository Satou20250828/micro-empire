export function renderPanelButtons() {
  return `
    <div class="flex gap-2">
      <button
        type="button"
        id="open-tech-tree"
        title="テックツリー"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        <span class="material-symbols-outlined text-xl text-sky-600">science</span>
      </button>
      <button
        type="button"
        id="open-cpu-status"
        title="CPU都市の状況"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        <span class="material-symbols-outlined text-xl text-rose-600">smart_toy</span>
      </button>
      <button
        type="button"
        id="open-rules"
        title="ルール確認"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        <span class="material-symbols-outlined text-xl text-emerald-600">menu_book</span>
      </button>
      <button
        type="button"
        id="reset-game"
        title="リセット（最初からやり直す）"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        <span class="material-symbols-outlined text-xl text-stone-600">refresh</span>
      </button>
    </div>
  `
}
