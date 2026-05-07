<template>
  <UCard class="mt-5 space-y-4">
    <UTable :data="paginatedSubdomains" :columns="columns" class="h-screen" />

    <div v-if="subdomains.length" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">Showing {{ start + 1 }}-{{ end }} of {{ subdomains.length }}</p>
      <UPagination v-model:page="page" :total="subdomains.length" :items-per-page="pageSize" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { SubdomainItem } from '~/types/website'

const emit = defineEmits<{
  edit: [subdomain: SubdomainItem]
  delete: [subdomain: SubdomainItem]
}>()

const props = defineProps<{ subdomains: SubdomainItem[] }>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.subdomains.length))
const paginatedSubdomains = computed(() => props.subdomains.slice(start.value, end.value))

watch(() => props.subdomains.length, () => page.value = 1)

const columns: TableColumn<SubdomainItem>[] = [
  {
    accessorKey: 'subdomain',
    header: 'Subdomain',
    cell: ({ row }) => h('div', {}, [
      h('p', { class: 'font-medium text-highlighted' }, `${row.original.subdomain}.${row.original.domain}`),
      h('p', { class: 'text-sm text-muted' }, row.original.document_root)
    ])
  },
  { accessorKey: 'domain', header: 'Domain' },
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