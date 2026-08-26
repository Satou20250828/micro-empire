export function renderPanelButtons() {
  return `
    <div class="flex gap-2">
      <button
        type="button"
        id="open-tech-tree"
        title="テックツリー"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        🔬
      </button>
      <button
        type="button"
        id="open-cpu-status"
        title="CPU都市の状況"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-lg hover:bg-stone-300"
      >
        🤖
      </button>
    </div>
  `
}
