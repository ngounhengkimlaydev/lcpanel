<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <UCard v-for="item in stats" :key="item.label" class="relative overflow-hidden">
      <div class="absolute -right-8 -top-8 size-28 rounded-full bg-primary/10" />

      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted">{{ item.label }}</p>
          <h3 class="mt-2 text-3xl font-bold text-highlighted">{{ item.value }}</h3>
          <p class="mt-2 text-sm" :class="item.color">{{ item.caption }}</p>
        </div>

        <div class="rounded-2xl bg-primary/10 p-3 text-primary">
          <UIcon :name="item.icon" class="size-7" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const stats = [
  {
    label: 'Active Subscriptions',
    value: '86',
    caption: '+9 this month',
    icon: 'i-lucide-badge-check',
    color: 'text-success'
  },
  {
    label: 'Monthly Revenue',
    value: '$4,820',
    caption: '+16.8% growth',
    icon: 'i-lucide-credit-card',
    color: 'text-info'
  },
  {
    label: 'Past Due',
    value: '7',
    caption: 'Need follow up',
    icon: 'i-lucide-circle-alert',
    color: 'text-warning'
  },
  {
    label: 'Cancelled',
    value: '12',
    caption: 'Last 30 days',
    icon: 'i-lucide-circle-x',
    color: 'text-error'
  }
]
</script>