<template>
  <UCard class="mt-5 space-y-4">
    <UTable :data="paginatedRedirects" :columns="columns" class="h-screen" />

    <div v-if="redirects.length" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">Showing {{ start + 1 }}-{{ end }} of {{ redirects.length }}</p>
      <UPagination v-model:page="page" :total="redirects.length" :items-per-page="pageSize" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { RedirectItem } from '~/types/website'

const emit = defineEmits<{
  edit: [redirect: RedirectItem]
  delete: [redirect: RedirectItem]
}>()

const props = defineProps<{ redirects: RedirectItem[] }>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.redirects.length))
const paginatedRedirects = computed(() => props.redirects.slice(start.value, end.value))

watch(() => props.redirects.length, () => page.value = 1)

const columns: TableColumn<RedirectItem>[] = [
  {
    accessorKey: 'source',
    header: 'Redirect',
    cell: ({ row }) => h('div', {}, [
      h('p', { class: 'font-medium text-highlighted' }, row.original.source),
      h('p', { class: 'text-sm text-muted' }, `→ ${row.original.target}`)
    ])
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.type === '301' ? 'success' : 'warning',
      variant: 'soft'
    }, { default: () => row.original.type })
  },
  {
    accessorKey: 'https',
    header: 'HTTPS',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.https ? 'success' : 'neutral',
      variant: 'soft'
    }, { default: () => row.original.https ? 'Enabled' : 'Disabled' })
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.status === 'active' ? 'success' : row.original.status === 'pending' ? 'warning' : 'neutral',
      variant: 'soft',
      class: 'capitalize'
    }, { default: () => row.original.status })
  },
  { accessorKey: 'created_at', header: 'Created' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [[
        { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit', row.original) },
        { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => emit('delete', row.original) }
      ]]

      return h(resolveComponent('UDropdownMenu'), { items }, {
        default: () => h(resolveComponent('UButton'), {
          icon: 'i-lucide-ellipsis',
          color: 'neutral',
          variant: 'ghost'
        })
      })
    }
  }
]
</script>