<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard
      v-for="stat in stats"
      :key="stat.label"
      :ui="{ body: 'flex items-center justify-between gap-4' }"
    >
      <div>
        <p class="text-sm text-muted">{{ stat.label }}</p>
        <p class="mt-1 text-2xl font-bold text-highlighted">{{ stat.value }}</p>
      </div>

      <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UIcon :name="stat.icon" class="size-5" />
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { BlockedIp } from '~/types/blocked-ip'

const props = defineProps<{
  items: BlockedIp[]
}>()

const stats = computed(() => [
  {
    label: 'Total Blocked',
    value: props.items.length,
    icon: 'i-lucide-ban'
  },
  {
    label: 'Active Blocks',
    value: props.items.filter((item) => item.status === 'active').length,
    icon: 'i-lucide-shield-alert'
  },
  {
    label: 'Whitelisted',
    value: props.items.filter((item) => item.status === 'whitelisted').length,
    icon: 'i-lucide-shield-check'
  },
  {
    label: 'Total Attempts',
    value: props.items
      .reduce((total, item) => total + item.attempts, 0)
      .toLocaleString(),
    icon: 'i-lucide-activity'
  }
])
</script>