<template>
  <div class="mt-4 overflow-hidden rounded-xl border border-default">
    <UTable :data="data" :columns="columns" class="h-screen">
      <template #empty>
        <div v-if="!data.length" class="py-12 text-center">
          <UIcon name="i-lucide-key" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No permission found</p>
          <p class="text-sm text-muted">Try changing your filter or create a permission.</p>
        </div>
      </template>
    </UTable>
    
    <div v-if="total" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </p>
      <UPagination :page="page" :items-per-page="pageSize" :total="total" @update:page="emit('update:page', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Role } from '~/types'

const props = defineProps<{
  data: Role[]
  columns: TableColumn<Role>[]
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const startItem = computed(() => {
  if (!props.total) return 0
  return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.page * props.pageSize, props.total)
})
</script>