<template>
  <div class="mt-4 rounded-xl border border-default">
    <UTable :data="subscriptions" :columns="columns" class="h-screen">
      <template #empty>
        <div v-if="!subscriptions.length" class="py-12 text-center">
          <UIcon name="i-lucide-credit-card" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No subscriptions found</p>
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
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Subscription } from '~/types';


const emit = defineEmits<{
  view: [subscription: Subscription]
  'update:page': [page: number]
}>()
const props = defineProps<{
  subscriptions: Subscription[]
  total: number
  page: number
  pageSize: number
}>()

const startItem = computed(() => {
  if (!props.total) return 0
  return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.page * props.pageSize, props.total)
})

function formatPrice(price: Subscription['price']) {
  const numeric = typeof price === 'number' ? price : Number(price)

  if (Number.isNaN(numeric)) return String(price)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numeric)
}

const columns: TableColumn<Subscription>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', {
        class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'
      }, row.original.customer.charAt(0)),
      h('div', {}, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.customer),
        h('p', { class: 'text-sm text-muted' }, row.original.email ?? '-')
      ])
    ])
  },
  { accessorKey: 'plan', header: 'Plan' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.price_formatted ?? formatPrice(row.original.price))
  },
  { accessorKey: 'websites', header: 'Websites' },
  { accessorKey: 'started_at', header: 'Start Date' },
  { accessorKey: 'expired_at', header: 'Expiry Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(resolveComponent('SubscriptionStatusBadge'), {
      status: row.original.status,
      statusKey: row.original.status_key,
      statusLabel: row.original.status_label
    })
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [
        [
          {
            label: 'View Details',
            icon: 'i-lucide-eye',
            onSelect: () => emit('view', row.original)
          }
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
