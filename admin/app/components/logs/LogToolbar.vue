<template>
  <div class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      :model-value="search"
      icon="i-lucide-search"
      placeholder="Search logs, source, IP or user..."
      :ui="{
        root: 'w-full',
        base: 'w-full sm:w-90'
      }"
      @update:model-value="$emit('update:search', String($event))"
    />

    <div class="flex items-center gap-2">
      <USelect
        :model-value="level"
        :items="levelItems"
        :ui="{ base: 'w-40' }"
        @update:model-value="$emit('update:level', String($event))"
      />

      <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" />
      <UButton icon="i-lucide-download" color="neutral" variant="outline" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  level: string
}>()

defineEmits<{
  'update:search': [value: string]
  'update:level': [value: string]
}>()

const levelItems = [
  { label: 'All Levels', value: 'all' },
  { label: 'Info', value: 'info' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' }
]
</script>