<template>
    <UCard class="space-y-4 mt-5">
        <UTable :data="data" :columns="columns" class="h-screen">
            <template #empty>
                <div v-if="!data.length" class="py-12 text-center">
                    <UIcon name="i-lucide-receipt-text" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No invoices found</p>
                    <p class="text-sm text-muted">Try changing your filter or search.</p>
                </div>
            </template>
        </UTable>

        <div v-if="total" class="flex items-center justify-between border-t border-default pt-4">
            <p class="text-sm text-muted">
                Showing {{ startItem }}-{{ endItem }} of {{ total }}
            </p>

            <UPagination :page="page" :total="total" :items-per-page="pageSize" @update:page="emit('update:page', $event)" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Invoice } from '~/types';


const props = defineProps<{
    data: Invoice[]
    total: number
    page: number
    pageSize: number
}>()

const emit = defineEmits<{
    view: [invoice: Invoice]
    download: [invoice: Invoice]
    'update:page': [page: number]
}>()

const startItem = computed(() => {
    if (!props.total) return 0
    return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
    return Math.min(props.page * props.pageSize, props.total)
})

function formatCurrency(amount: Invoice['amount']) {
    const numeric = typeof amount === 'number' ? amount : Number(amount)

    if (Number.isNaN(numeric)) return String(amount)

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(numeric)
}

function getStatusKey(invoice: Invoice) {
    if (invoice.status_key) return invoice.status_key
    if (invoice.status === 1) return 'paid'
    if (invoice.status === 2) return 'unpaid'
    if (invoice.status === 3) return 'overdue'
    return String(invoice.status).toLowerCase()
}

const columns: TableColumn<Invoice>[] = [
    {
        accessorKey: 'code',
        header: 'Invoice ID',
        cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.code ?? row.original.id)
    },
    { accessorKey: 'customer', header: 'Customer' },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.amount_formatted ?? formatCurrency(row.original.amount))
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const colorMap: Record<string, string> = {
                paid: 'success',
                unpaid: 'warning',
                overdue: 'error',
                draft: 'neutral'
            }
            const statusKey = getStatusKey(row.original)
            const label = row.original.status_label ?? statusKey

            return h(resolveComponent('UBadge'), {
                color: colorMap[statusKey] || 'neutral',
                variant: 'soft',
                class: 'capitalize'
            }, {
                default: () => label
            })
        }
    },
    { accessorKey: 'due_date', header: 'Due Date' },
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
                        label: 'Download PDF',
                        icon: 'i-lucide-download',
                        onSelect: () => emit('download', row.original)
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
