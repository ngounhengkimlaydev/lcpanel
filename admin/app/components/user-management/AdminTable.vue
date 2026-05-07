<template>
  <div class="mt-4 overflow-hidden rounded-xl border border-default">
    <UTable :data="paginatedData" :columns="columns" class="h-screen"/>

    <div v-if="!data.length" class="py-12 text-center">
      <UIcon name="i-lucide-users" class="mx-auto mb-3 size-10 text-muted" />
      <p class="font-medium text-highlighted">No admin users found</p>
      <p class="text-sm text-muted">Try changing your filter or create a user.</p>
    </div>

    <div v-else class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        Showing {{ startItem }}-{{ endItem }} of {{ data.length }}
      </p>

      <UPagination v-model:page="page" :items-per-page="pageSize" :total="data.length" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AdminUser } from '~/types/admin'

const props = defineProps<{
  data: AdminUser[]
  columns: TableColumn<AdminUser>[]
}>()

const page = ref(1)
const pageSize = ref(10)

const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return props.data.slice(start, start + pageSize.value)
})

const startItem = computed(() => {
  if (!props.data.length) return 0
  return (page.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(page.value * pageSize.value, props.data.length)
})

watch(
  () => props.data.length,
  () => {
    page.value = 1
  }
)
</script>