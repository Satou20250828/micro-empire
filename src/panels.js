export function renderPanelButtons() {
  return `
    <div class="flex gap-2">
      <button
        type="button"
        disabled
        title="テックツリー（近日公開）"
        class="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-stone-200 text-lg opacity-50"
      >
        🔬
      </button>
      <button
        type="button"
        disabled
        title="CPU都市の状況（近日公開）"
        class="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-stone-200 text-lg opacity-50"
      >
        🤖
      </button>
    </div>
  `
}
