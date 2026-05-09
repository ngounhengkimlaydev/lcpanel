<template>
  <UCard>
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <UInput
        :model-value="search"
        icon="i-lucide-search"
        placeholder="Search IP, country, reason..."
        class="w-full lg:max-w-md"
        @update:model-value="emit('update:search', String($event ?? ''))"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
        <USelect
          :model-value="status"
          :items="statusOptions"
          value-key="value"
          class="w-full sm:w-40"
          @update:model-value="emit('update:status', String($event ?? 'all'))"
        />

        <USelect
          :model-value="scope"
          :items="scopeOptions"
          value-key="value"
          class="w-full sm:w-40"
          @update:model-value="emit('update:scope', String($event ?? 'all'))"
        />

        <USelect
          :model-value="type"
          :items="typeOptions"
          value-key="value"
          class="w-full sm:w-40"
          @update:model-value="emit('update:type', String($event ?? 'all'))"
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
  scope: string
  type: string
  statusOptions: SelectOption[]
  scopeOptions: SelectOption[]
  typeOptions: SelectOption[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  'update:scope': [value: string]
  'update:type': [value: string]
}>()
</script>