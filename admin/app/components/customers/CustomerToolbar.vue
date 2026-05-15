<template>
  <div class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      :model-value="search"
      icon="i-lucide-search"
      placeholder="Search customer..."
      class="w-full sm:max-w-sm"
      @update:model-value="$emit('update:search', String($event))"
    />

    <USelect
      :model-value="status"
      :items="statusItems"
      class="w-40"
      @update:model-value="$emit('update:status', String($event))"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  status: string
}>()

defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
}>()

const statusItems = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' },
  { label: 'Disabled', value: '2' }
]
</script>
