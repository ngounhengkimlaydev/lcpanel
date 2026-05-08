<template>
    <UDashboardPanel id="activity-logs">
        <template #header>
            <UDashboardNavbar title="Activity Logs" />
        </template>

        <template #body>
            <div class="space-y-6">

                <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <UInput v-model="search" icon="i-lucide-search" placeholder="Search activity..."
                        class="max-2xl" />

                    <div class="flex flex-wrap gap-2">
                        <USelect v-model="moduleFilter" :items="moduleItems" class="w-44" />
                        <USelect v-model="actionFilter" :items="actionItems" class="w-40" />
                        <USelect v-model="statusFilter" :items="statusItems" class="w-40" />
                    </div>
                </div>

                <UTable :data="filteredLogs" :columns="columns" />

                <div v-if="!filteredLogs.length" class="py-12 text-center">
                    <UIcon name="i-lucide-history" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No activity logs found</p>
                    <p class="text-sm text-muted">Try changing your search or filter.</p>
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ActivityLog } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.ACTIVITY_LOG,
})

const search = ref('')
const moduleFilter = ref('all')
const actionFilter = ref('all')
const statusFilter = ref('all')

const logs = ref<ActivityLog[]>([
    {
        id: 1,
        user: 'Lay Admin',
        email: 'admin@ltech.digital',
        module: 'Admin Users',
        action: 'create',
        description: 'Created admin user Support User',
        status: 'success',
        ip_address: '192.168.18.66',
        created_at: '2026-05-05 10:30 AM'
    },
    {
        id: 2,
        user: 'Lay Admin',
        email: 'admin@ltech.digital',
        module: 'Roles',
        action: 'update',
        description: 'Updated permissions for Support role',
        status: 'success',
        ip_address: '192.168.18.66',
        created_at: '2026-05-05 10:18 AM'
    },
    {
        id: 3,
        user: 'Support User',
        email: 'support@ltech.digital',
        module: 'Invoices',
        action: 'delete',
        description: 'Failed to delete invoice INV-003',
        status: 'failed',
        ip_address: '192.168.18.88',
        created_at: '2026-05-05 09:45 AM'
    },
    {
        id: 4,
        user: 'Lay Admin',
        email: 'admin@ltech.digital',
        module: 'Subscriptions',
        action: 'renew',
        description: 'Renewed subscription for LTech Digital',
        status: 'success',
        ip_address: '192.168.18.66',
        created_at: '2026-05-05 09:20 AM'
    }
])

const moduleItems = [
    { label: 'All Modules', value: 'all' },
    { label: 'Admin Users', value: 'Admin Users' },
    { label: 'Roles', value: 'Roles' },
    { label: 'Permissions', value: 'Permissions' },
    { label: 'Invoices', value: 'Invoices' },
    { label: 'Subscriptions', value: 'Subscriptions' },
    { label: 'Customers', value: 'Customers' }
]

const actionItems = [
    { label: 'All Actions', value: 'all' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Renew', value: 'renew' },
    { label: 'Login', value: 'login' }
]

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' }
]

const stats = computed(() => [
    {
        label: 'Total Logs',
        value: logs.value.length,
        icon: 'i-lucide-history'
    },
    {
        label: 'Success',
        value: logs.value.filter((item) => item.status === 'success').length,
        icon: 'i-lucide-check-circle'
    },
    {
        label: 'Failed',
        value: logs.value.filter((item) => item.status === 'failed').length,
        icon: 'i-lucide-x-circle'
    },
    {
        label: 'Users',
        value: new Set(logs.value.map((item) => item.email)).size,
        icon: 'i-lucide-users'
    }
])

const filteredLogs = computed(() => {
    return logs.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.user.toLowerCase().includes(keyword) ||
            item.email.toLowerCase().includes(keyword) ||
            item.module.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword) ||
            item.ip_address.toLowerCase().includes(keyword)

        const matchModule = moduleFilter.value === 'all' || item.module === moduleFilter.value
        const matchAction = actionFilter.value === 'all' || item.action === actionFilter.value
        const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value

        return matchSearch && matchModule && matchAction && matchStatus
    })
})

const columns: TableColumn<ActivityLog>[] = [
    {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary'
            }, row.original.user.charAt(0)),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.user),
                h('p', { class: 'text-sm text-muted' }, row.original.email)
            ])
        ])
    },
    {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: 'primary',
            variant: 'soft'
        }, {
            default: () => row.original.module
        })
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: getActionColor(row.original.action),
            variant: 'soft',
            class: 'capitalize'
        }, {
            default: () => row.original.action
        })
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => h('p', {
            class: 'max-w-[360px] truncate text-sm text-muted'
        }, row.original.description)
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: row.original.status === 'success' ? 'success' : 'error',
            variant: 'soft',
            class: 'capitalize'
        }, {
            default: () => row.original.status
        })
    },
    {
        accessorKey: 'ip_address',
        header: 'IP Address'
    },
    {
        accessorKey: 'created_at',
        header: 'Date'
    }
]

function getActionColor(action: string): 'success' | 'warning' | 'error' | 'primary' | 'neutral' {
    if (action === 'create') return 'success'
    if (action === 'update') return 'warning'
    if (action === 'delete') return 'error'
    if (action === 'renew') return 'primary'

    return 'neutral'
}
</script>
