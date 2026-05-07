<template>
  <div class="mt-4 rounded-xl border border-default">
    <UTable :data="paginatedSubscriptions" :columns="columns" class=" h-screen" />

    <div v-if="!subscriptions.length" class="py-12 text-center">
      <UIcon name="i-lucide-credit-card" class="mx-auto mb-3 size-10 text-muted" />
      <p class="font-medium text-highlighted">No subscriptions found</p>
      <p class="text-sm text-muted">Try changing your filter or create a subscription.</p>
    </div>

    <div v-else class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">
        Showing {{ startItem }}-{{ endItem }} of {{ subscriptions.length }}
      </p>

      <UPagination v-model:page="page" :items-per-page="pageSize" :total="subscriptions.length" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Subscription } from '~/types';


const emit = defineEmits<{
  view: [subscription: Subscription]
  renew: [subscription: Subscription]
  'change-plan': [subscription: Subscription]
  cancel: [subscription: Subscription]
}>()
const props = defineProps<{
  subscriptions: Subscription[]
}>()

const page = ref(1)
const pageSize = ref(10)

const paginatedSubscriptions = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value

  return props.subscriptions.slice(start, end)
})

const startItem = computed(() => {
  if (!props.subscriptions.length) return 0
  return (page.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(page.value * pageSize.value, props.subscriptions.length)
})

watch(
  () => props.subscriptions.length,
  () => {
    page.value = 1
  }
)

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
        h('p', { class: 'text-sm text-muted' }, row.original.email)
      ])
    ])
  },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'websites', header: 'Websites' },
  { accessorKey: 'started_at', header: 'Start Date' },
  { accessorKey: 'expired_at', header: 'Expiry Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(resolveComponent('SubscriptionStatusBadge'), {
      status: row.original.status
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
        ],
        [
          {
            label: 'Renew',
            icon: 'i-lucide-refresh-cw',
            onSelect: () => emit('renew', row.original)
          }
        ],
        [
          {
            label: 'Change Plan',
            icon: 'i-lucide-repeat',
            onSelect: () => emit('change-plan', row.original)
          }
        ],
        [
          {
            label: 'Cancel',
            icon: 'i-lucide-ban',
            color: 'error',
            onSelect: () => emit('cancel', row.original)
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