<template>
  <UCard class="space-y-4 mt-5">
    <UTable :data="customers" :columns="columns" class="h-screen">
      <template #empty>
        <div v-if="!customers.length" class="py-12 text-center">
          <UIcon name="i-lucide-users" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No customers found</p>
          <p class="text-sm text-muted">Try changing your filter or search.</p>
        </div>
      </template>
    </UTable>
    <div v-if="total" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        Showing {{ startItem }}-{{ endItem }} of {{ total }}
      </p>
      <UPagination :page="page" :items-per-page="pageSize" :total="total" @update:page="emit('update:page', $event)" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Customer } from '~/types';

const emit = defineEmits<{
  edit: [customer: Customer]
  'update:page': [page: number]
}>()

const props = defineProps<{
  customers: Customer[]
  total: number
  page: number
  pageSize: number
}>()

const Status = {
  INACTIVE: 0,
  ACTIVE: 1,
  DISABLED: 2,
}

const startItem = computed(() => {
  if (!props.total) return 0
  return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.page * props.pageSize, props.total)
})

function getStatusMeta(status: Customer['status']) {
  switch (status) {
    case Status.ACTIVE:
      return { color: 'success' as const, label: 'Active' }
    case Status.INACTIVE:
      return { color: 'warning' as const, label: 'Inactive' }
    case Status.DISABLED:
      return { color: 'error' as const, label: 'Disabled' }
    default:
      return { color: 'neutral' as const, label: 'Unknown' }
  }
}

const columns: TableColumn<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Customer',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', {
        class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'
      }, row.original.name.charAt(0)),
      h('div', {}, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.name),
        h('p', { class: 'text-sm text-muted' }, row.original.email ?? '-')
      ])
    ])
  },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'websites', header: 'Websites' },
  { accessorKey: 'storage', header: 'Storage' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getStatusMeta(row.original.status)

      return h(resolveComponent('UBadge'), {
        color: status.color,
        variant: 'soft',
        class: 'capitalize'
      }, {
        default: () => status.label
      })
    }
  },
  { accessorKey: 'created_at', header: 'Joined' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [
        [
          { label: 'View', icon: 'i-lucide-eye' },
          // {
          //   label: 'Edit',
          //   icon: 'i-lucide-pencil',
          //   onSelect: () => emit('edit', row.original)
          // },
          { label: 'Suspend', icon: 'i-lucide-ban' }
        ]
      ]

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
