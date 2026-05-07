<template>
    <UCard>
        <UTable :data="paginatedServices" :columns="columns" class=" h-screen">
            <template #empty>
                <div class="py-12 text-center">
                    <UIcon name="i-lucide-server-off" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">
                        No services found
                    </p>
                    <p class="text-sm text-muted">
                        Try changing your filter or search.
                    </p>
                </div>
            </template>
        </UTable>

        <div v-if="services.length" class="flex items-center justify-between border-t border-default px-4 py-3">
            <p class="text-sm text-muted">
                Showing {{ start + 1 }}-{{ end }} of {{ services.length }}
            </p>

            <UPagination v-model:page="page" :total="services.length" :items-per-page="pageSize" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { SystemService } from '~/types';

const emit = defineEmits<{
    start: [service: SystemService]
    stop: [service: SystemService]
    restart: [service: SystemService]
}>()

const props = defineProps<{
    services: SystemService[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.services.length))

const paginatedServices = computed(() => {
    return props.services.slice(start.value, end.value)
})

watch(
    () => props.services.length,
    () => {
        page.value = 1
    }
)

const statusColor: Record<string, string> = {
    running: 'success',
    stopped: 'neutral',
    failed: 'error',
    unknown: 'warning'
}

const columns: TableColumn<SystemService>[] = [
    {
        accessorKey: 'name',
        header: 'Service',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'
            }, [
                h(resolveComponent('UIcon'), {
                    name: 'i-lucide-server',
                    class: 'size-5'
                })
            ]),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                h('p', { class: 'text-sm text-muted' }, row.original.description)
            ])
        ])
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: statusColor[row.original.status] || 'neutral',
            variant: 'soft',
            class: 'capitalize'
        }, {
            default: () => row.original.status
        })
    },
    {
        accessorKey: 'port',
        header: 'Port',
        cell: ({ row }) => row.original.port || '-'
    },
    {
        accessorKey: 'uptime',
        header: 'Uptime'
    },
    {
        accessorKey: 'memory',
        header: 'Memory'
    },
    {
        accessorKey: 'auto_start',
        header: 'Auto Start',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: row.original.auto_start ? 'success' : 'neutral',
            variant: 'soft'
        }, {
            default: () => row.original.auto_start ? 'Enabled' : 'Disabled'
        })
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const service = row.original

            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Start',
                        icon: 'i-lucide-play',
                        disabled: service.status === 'running',
                        onSelect: () => emit('start', service)
                    },
                    {
                        label: 'Stop',
                        icon: 'i-lucide-square',
                        disabled: service.status !== 'running',
                        onSelect: () => emit('stop', service)
                    },
                    {
                        label: 'Restart',
                        icon: 'i-lucide-refresh-cw',
                        onSelect: () => emit('restart', service)
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