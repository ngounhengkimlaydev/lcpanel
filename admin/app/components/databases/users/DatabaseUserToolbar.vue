<template>
  <UCard>
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <UInput
        :model-value="search"
        icon="i-lucide-search"
        placeholder="Search username, host, database..."
        class="w-full lg:max-w-md"
        @update:model-value="emit('update:search', String($event ?? ''))"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
        <USelect
          :model-value="status"
          :items="statusOptions"
          value-key="value"
          class="w-full sm:w-40"
          @update:model-value="emit('update:status', String($event ?? 'all'))"
        />

        <USelect
          :model-value="authType"
          :items="authTypeOptions"
          value-key="value"
          class="w-full sm:w-44"
          @update:model-value="emit('update:auth-type', String($event ?? 'all'))"
        />
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
type SelectOption = {
  label: string
  value: string
}

defineProps<{
  search: string
  status: string
  authType: string
  statusOptions: SelectOption[]
  authTypeOptions: SelectOption[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  'update:auth-type': [value: string]
}>()
</script>