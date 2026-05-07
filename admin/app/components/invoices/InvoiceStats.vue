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
    label: 'Total Customers',
    value: '128',
    caption: '+12 this month',
    icon: 'i-lucide-users',
    color: 'text-success'
  },
  {
    label: 'Active Customers',
    value: '104',
    caption: '81% active rate',
    icon: 'i-lucide-user-check',
    color: 'text-success'
  },
  {
    label: 'Suspended',
    value: '9',
    caption: 'Need review',
    icon: 'i-lucide-user-x',
    color: 'text-warning'
  },
  {
    label: 'Monthly Revenue',
    value: '$2,480',
    caption: '+18.4% growth',
    icon: 'i-lucide-credit-card',
    color: 'text-info'
  }
]
</script>