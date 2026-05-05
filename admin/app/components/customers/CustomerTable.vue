<template>
  <div class="space-y-4">
    <UTable :data="paginatedCustomers" :columns="columns" />

    <div v-if="!customers.length" class="py-12 text-center">
      <UIcon name="i-lucide-users" class="mx-auto mb-3 size-10 text-muted" />
      <p class="font-medium text-highlighted">No customers found</p>
      <p class="text-sm text-muted">Try changing your filter or search.</p>
    </div>

    <div v-else class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        Showing {{ start + 1 }}-{{ end }} of {{ customers.length }}
      </p>

      <UPagination v-model:page="page" :total="customers.length" :items-per-page="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Customer } from '~/types';
const emit = defineEmits<{
  edit: [customer: Customer]
}>()

const props = defineProps<{
  customers: Customer[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.customers.length))

const paginatedCustomers = computed(() => {
  return props.customers.slice(start.value, end.value)
})

watch(
  () => props.customers.length,
  () => {
    page.value = 1
  }
)

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
        h('p', { class: 'text-sm text-muted' }, row.original.email)
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
      const status = row.original.status

      const colorMap: Record<string, string> = {
        active: 'success',
        suspended: 'error',
        inactive: 'neutral',
        pending: 'warning'
      }

      return h(resolveComponent('UBadge'), {
        color: colorMap[status] || 'neutral',
        variant: 'soft',
        class: 'capitalize'
      }, {
        default: () => status
      })
    }
  },
  { accessorKey: 'created_at', header: 'Joined' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [
        [
          { label: 'View', icon: 'i-lucide-eye' },
          {
            label: 'Edit',
            icon: 'i-lucide-pencil',
            onSelect: () => emit('edit', row.original)
          },
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