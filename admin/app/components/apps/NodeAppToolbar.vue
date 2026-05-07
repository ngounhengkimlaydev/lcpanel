<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      :model-value="search"
      icon="i-lucide-search"
      placeholder="Search app, domain or path..."
      class="w-full sm:max-w-sm"
      @update:model-value="emit('update:search', String($event))"
    />

    <USelect
      :model-value="status"
      :items="statusItems"
      class="w-full sm:w-44"
      @update:model-value="emit('update:status', String($event))"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  status: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
}>()

const statusItems = [
  { label: 'All Status', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Error', value: 'error' }
]
</script>