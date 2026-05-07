<template>
    <UCard class="mt-5 space-y-4">
        <UTable :data="paginatedPorts" :columns="columns" class="h-screen">
            <template #empty>
                <div class="py-12 text-center">
                    <UIcon name="i-lucide-network" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No ports found</p>
                    <p class="text-sm text-muted">Try changing your filter or search.</p>
                </div>
            </template>
        </UTable>

        <div v-if="ports.length" class="flex items-center justify-between border-t border-default px-4 py-3">
            <p class="text-sm text-muted">
                Showing {{ start + 1 }}-{{ end }} of {{ ports.length }}
            </p>

            <UPagination v-model:page="page" :total="ports.length" :items-per-page="pageSize" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Port } from '~/types';

const emit = defineEmits<{
    edit: [port: Port]
    delete: [port: Port]
}>()

const props = defineProps<{
    ports: Port[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.ports.length))

const paginatedPorts = computed(() => {
    return props.ports.slice(start.value, end.value)
})

watch(
    () => props.ports.length,
    () => {
        page.value = 1
    }
)

const columns: TableColumn<Port>[] = [
    {
        accessorKey: 'port',
        header: 'Port',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'
            }, String(row.original.port)),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.service),
                h('p', { class: 'text-sm text-muted' }, row.original.description)
            ])
        ])
    },
    {
        accessorKey: 'protocol',
        header: 'Protocol',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: 'neutral',
            variant: 'soft'
        }, {
            default: () => row.original.protocol
        })
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status

            const colorMap: Record<string, string> = {
                open: 'success',
                closed: 'error',
                filtered: 'warning'
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
    {
        accessorKey: 'created_at',
        header: 'Created'
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Edit',
                        icon: 'i-lucide-pencil',
                        onSelect: () => emit('edit', row.original)
                    },
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