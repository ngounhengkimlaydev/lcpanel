<template>
  <div class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
    <UInput
      :model-value="search"
      icon="i-lucide-search"
      placeholder="Search customer, email, or plan..."
      class="w-full sm:max-w-sm"
      @update:model-value="$emit('update:search', String($event))"
    />

    <div class="flex items-center gap-2">
      <USelect
        :model-value="status"
        :items="statusItems"
        class="w-44"
        @update:model-value="$emit('update:status', String($event))"
      />
    </div>
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
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Disabled', value: 'disabled' }
]
</script>
