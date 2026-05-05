<template>
    <UDashboardPanel id="roles">
        <template #header>
            <UDashboardNavbar title="Roles">
                <template #right>
                    <UButton icon="i-lucide-shield-plus" label="Create Role" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <UInput v-model="search" icon="i-lucide-search" placeholder="Search role..."
                    class="w-full sm:max-w-sm" />
                <USelect v-model="status" :items="statusItems" class="w-44" />
            </div>

            <UTable :data="filteredRoles" :columns="columns" />

            <RoleFormModal v-model:open="isModalOpen" :type="modalType" :role="selectedRole" @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import RoleFormModal from '~/components/user-management/RoleFormModal.vue'


type Role = {
    id: number
    name: string
    description: string
    users: number
    status: string
    permissions: string[]
    created_at: string
}

const search = ref('')
const status = ref('all')

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedRole = ref<Role | null>(null)

const roles = ref<Role[]>([
    {
        id: 1,
        name: 'Super Admin',
        description: 'Full access to all modules and system settings.',
        users: 1,
        status: 'active',
        permissions: ['dashboard.view', 'users.manage', 'roles.manage', 'billing.manage'],
        created_at: '2026-05-01'
    },
    {
        id: 2,
        name: 'Support',
        description: 'Can view customers, subscriptions, and invoices.',
        users: 3,
        status: 'active',
        permissions: ['customers.view', 'subscriptions.view', 'invoices.view'],
        created_at: '2026-05-03'
    }
])

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
]

const filteredRoles = computed(() => {
    return roles.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

const columns: TableColumn<Role>[] = [
    {
        accessorKey: 'name',
        header: 'Role',
        cell: ({ row }) => h('div', {}, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.name),
            h('p', { class: 'text-sm text-muted line-clamp-1' }, row.original.description)
        ])
    },
    { accessorKey: 'users', header: 'Users' },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: 'primary',
            variant: 'soft'
        }, {
            default: () => `${row.original.permissions.length} permissions`
        })
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => h(resolveComponent('UBadge'), {
            color: row.original.status === 'active' ? 'success' : 'neutral',
            variant: 'soft',
            class: 'capitalize'
        }, {
            default: () => row.original.status
        })
    },
    { accessorKey: 'created_at', header: 'Created At' },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const items: DropdownMenuItem[][] = [
                [
                    {
                        label: 'Edit',
                        icon: 'i-lucide-pencil',
                        onSelect: () => openEditModal(row.original)
                    },
                    {
                        label: row.original.status === 'active' ? 'Disable' : 'Enable',
                        icon: row.original.status === 'active' ? 'i-lucide-ban' : 'i-lucide-check-circle',
                        onSelect: () => toggleStatus(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => deleteRole(row.original)
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

function openCreateModal() {
    modalType.value = 'create'
    selectedRole.value = null
    isModalOpen.value = true
}

function openEditModal(role: Role) {
    modalType.value = 'edit'
    selectedRole.value = role
    isModalOpen.value = true
}

function handleSubmit(payload: Role) {
    if (modalType.value === 'create') {
        roles.value.unshift({
            ...payload,
            id: Date.now(),
            users: 0,
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const current = roles.value.find((item) => item.id === payload.id)
        if (!current) return

        current.name = payload.name
        current.description = payload.description
        current.status = payload.status
        current.permissions = payload.permissions
    }

    isModalOpen.value = false
}

function toggleStatus(role: Role) {
    const current = roles.value.find((item) => item.id === role.id)
    if (!current) return

    current.status = current.status === 'active' ? 'inactive' : 'active'
}

function deleteRole(role: Role) {
    roles.value = roles.value.filter((item) => item.id !== role.id)
}
</script>