<template>
    <UCard class="mt-5 space-y-4">
        <UTable :data="paginatedProcesses" :columns="columns" class="h-screen">
            <template #empty>
                <div class="py-12 text-center">
                    <UIcon name="i-lucide-cpu" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No processes found</p>
                    <p class="text-sm text-muted">Try changing your filter or search.</p>
                </div>
            </template>
        </UTable>

        <div v-if="processes.length" class="flex items-center justify-between border-t border-default px-4 py-3">
            <p class="text-sm text-muted">
                Showing {{ start + 1 }}-{{ end }} of {{ processes.length }}
            </p>

            <UPagination v-model:page="page" :total="processes.length" :items-per-page="pageSize" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { ServerProcess } from '~/types';

const emit = defineEmits<{
    edit: [process: ServerProcess]
    delete: [process: ServerProcess]
}>()

const props = defineProps<{
    processes: ServerProcess[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.processes.length))

const paginatedProcesses = computed(() => {
    return props.processes.slice(start.value, end.value)
})

watch(
    () => props.processes.length,
    () => {
        page.value = 1
    }
)

const columns: TableColumn<ServerProcess>[] = [
    {
        accessorKey: 'name',
        header: 'Process',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'
            }, row.original.name.charAt(0).toUpperCase()),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                h('p', { class: 'text-sm text-muted' }, `PID: ${row.original.pid}`)
            ])
        ])
    },
    { accessorKey: 'user', header: 'User' },
    {
        accessorKey: 'cpu',
        header: 'CPU',
        cell: ({ row }) => `${row.original.cpu}%`
    },
    {
        accessorKey: 'memory',
        header: 'Memory',
        cell: ({ row }) => `${row.original.memory} MB`
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status

            const colorMap: Record<string, string> = {
                running: 'success',
                stopped: 'neutral',
                sleeping: 'warning',
                error: 'error'
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
    { accessorKey: 'uptime', header: 'Uptime' },
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
                        label: 'Kill Process',
                        icon: 'i-lucide-circle-x',
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