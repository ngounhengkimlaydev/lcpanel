<template>
  <div class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      :model-value="search"
      icon="i-lucide-search"
      placeholder="Search hosting plan..."
      class="w-full sm:max-w-sm"
      @update:model-value="$emit('update:search', String($event))"
    />

    <div class="flex items-center gap-2">
      <USelect
        :model-value="status"
        :items="statusItems"
        class="w-40"
        @update:model-value="$emit('update:status', $event === 'all' ? 'all' : Number($event))"
      />

      <UButton icon="i-lucide-filter" color="neutral" variant="outline" />
      <UButton icon="i-lucide-download" color="neutral" variant="outline" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { planStatusItems } from '~/utils/plan'

defineProps<{
  search: string
  status: number | 'all'
}>()

defineEmits<{
  'update:search': [value: string]
  'update:status': [value: number | 'all']
}>()

const statusItems = [
  { label: 'All Status', value: 'all' },
  ...planStatusItems
]
</script>
