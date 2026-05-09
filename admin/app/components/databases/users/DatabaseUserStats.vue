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
import type { DatabaseUser } from '~/types/database-user'

const props = defineProps<{
  items: DatabaseUser[]
}>()

const stats = computed(() => [
  {
    label: 'Total Users',
    value: props.items.length,
    icon: 'i-lucide-users'
  },
  {
    label: 'Active Users',
    value: props.items.filter((item) => item.status === 'active').length,
    icon: 'i-lucide-user-check'
  },
  {
    label: 'Suspended',
    value: props.items.filter((item) => item.status === 'suspended').length,
    icon: 'i-lucide-user-x'
  },
  {
    label: 'Connections',
    value: props.items
      .reduce((total, item) => total + item.connections, 0)
      .toLocaleString(),
    icon: 'i-lucide-plug'
  }
])
</script>