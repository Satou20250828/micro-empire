const RESOURCE_META = [
  { key: 'food', icon: 'grass', iconColor: 'text-lime-600', label: '食料', style: 'bg-lime-100 text-lime-800' },
  { key: 'production', icon: 'settings', iconColor: 'text-amber-600', label: '生産力', style: 'bg-amber-100 text-amber-800' },
  { key: 'gold', icon: 'monetization_on', iconColor: 'text-yellow-600', label: '金', style: 'bg-yellow-100 text-yellow-800' },
]

export function createResources() {
  return { food: 0, production: 0, gold: 0 }
}

export function addResources(resources, delta) {
  resources.food += delta.food ?? 0
  resources.production += delta.production ?? 0
  resources.gold += delta.gold ?? 0
  return resources
}

export function renderResources(resources) {
  return `
    <div class="flex gap-3">
      ${RESOURCE_META.map(
        (meta) => `
          <div
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 ${meta.style}"
            title="${meta.label}"
          >
            <span class="material-symbols-outlined text-lg ${meta.iconColor}">${meta.icon}</span>
            <span class="font-semibold" data-resource="${meta.key}">${resources[meta.key]}</span>
          </div>
        `,
      ).join('')}
    </div>
  `
}
