<template>
    <UCard class="mt-5 space-y-4">
        <UTable :data="paginatedCronJobs" :columns="columns" class="h-screen">
            <template #empty>
                <div class="py-12 text-center">
                    <UIcon name="i-lucide-clock-3" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No cron jobs found</p>
                    <p class="text-sm text-muted">Try changing your filter or search.</p>
                </div>
            </template>
        </UTable>

        <div v-if="cronJobs.length" class="flex items-center justify-between border-t border-default px-4 py-3">
            <p class="text-sm text-muted">
                Showing {{ start + 1 }}-{{ end }} of {{ cronJobs.length }}
            </p>

            <UPagination v-model:page="page" :total="cronJobs.length" :items-per-page="pageSize" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { CronJob } from '~/types/cron-job'

const emit = defineEmits<{
    edit: [cronJob: CronJob]
    delete: [cronJob: CronJob]
}>()

const props = defineProps<{
    cronJobs: CronJob[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.cronJobs.length))

const paginatedCronJobs = computed(() => {
    return props.cronJobs.slice(start.value, end.value)
})

watch(
    () => props.cronJobs.length,
    () => {
        page.value = 1
    }
)

const columns: TableColumn<CronJob>[] = [
    {
        accessorKey: 'name',
        header: 'Cron Job',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'
            }, row.original.name.charAt(0).toUpperCase()),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                h('p', { class: 'text-sm text-muted' }, row.original.command)
            ])
        ])
    },
    {
        accessorKey: 'schedule',
        header: 'Schedule',
        cell: ({ row }) => h('code', {
            class: 'rounded bg-muted px-2 py-1 text-xs'
        }, row.original.schedule)
    },
    { accessorKey: 'user', header: 'User' },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status

            const colorMap: Record<string, string> = {
                active: 'success',
                paused: 'warning',
                failed: 'error'
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
    { accessorKey: 'last_run', header: 'Last Run' },
    { accessorKey: 'next_run', header: 'Next Run' },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Run Now',
                        icon: 'i-lucide-play'
                    },
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