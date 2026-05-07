<template>
  <div class="grid grid-cols-1 gap-4 ">
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
    label: 'Total Plans',
    value: '3',
    caption: '2 active plans',
    icon: 'i-lucide-package',
    color: 'text-success'
  },
  {
    label: 'Subscribed Users',
    value: '39',
    caption: '+8 this month',
    icon: 'i-lucide-users',
    color: 'text-info'
  },
  {
    label: 'Monthly Revenue',
    value: '$612',
    caption: '+14.2% growth',
    icon: 'i-lucide-credit-card',
    color: 'text-success'
  },
  {
    label: 'Avg. Plan Price',
    value: '$23',
    caption: 'Across active plans',
    icon: 'i-lucide-chart-no-axes-column',
    color: 'text-warning'
  }
]
</script>