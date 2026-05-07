<template>
    <UCard class="space-y-4 mt-5">
        <UTable :data="paginatedData" :columns="columns" class=" h-screen" />

        <div v-if="paginatedData.length" class="flex items-center justify-between border-t border-default pt-4">
            <p class="text-sm text-muted">
                Showing {{ start + 1 }}-{{ end }} of {{ data.length }}
            </p>

            <UPagination v-model:page="page" :total="data.length" :items-per-page="pageSize" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Invoice } from '~/types';


const props = defineProps<{
    data: Invoice[]
}>()

const emit = defineEmits<{
    view: [invoice: Invoice]
    paid: [invoice: Invoice]
    send: [invoice: Invoice]
    download: [invoice: Invoice]
    delete: [invoice: Invoice]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.data.length))

const paginatedData = computed(() => {
    return props.data.slice(start.value, end.value)
})

watch(
    () => props.data.length,
    () => {
        page.value = 1
    }
)

const columns: TableColumn<Invoice>[] = [
    { accessorKey: 'id', header: 'Invoice ID' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'amount', header: 'Amount' },
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

            return h(resolveComponent('UBadge'), {
                color: colorMap[row.original.status] || 'neutral',
                variant: 'soft',
                class: 'capitalize'
            }, {
                default: () => row.original.status
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
                        label: 'Mark as Paid',
                        icon: 'i-lucide-check-circle',
                        onSelect: () => emit('paid', row.original)
                    }
                ],
                [
                    {
                        label: 'Send Invoice',
                        icon: 'i-lucide-send',
                        onSelect: () => emit('send', row.original)
                    },
                    {
                        label: 'Download PDF',
                        icon: 'i-lucide-download',
                        onSelect: () => emit('download', row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => emit('delete', row.original)
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