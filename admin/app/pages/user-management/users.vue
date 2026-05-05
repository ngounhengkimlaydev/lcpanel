<template>
    <UDashboardPanel id="admin-users">
        <template #header>
            <UDashboardNavbar title="Admin Users">
                <template #right>
                    <UButton icon="i-lucide-user-plus" label="Create User" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="space-y-6">
                <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <UInput v-model="search" icon="i-lucide-search" placeholder="Search user..."
                        class="w-full sm:max-w-sm" />

                    <USelect v-model="status" :items="statusItems" class="w-44" />
                </div>

                <UTable :data="filteredUsers" :columns="columns" />

                <UserFormModal v-model:open="isModalOpen" :type="modalType" :user="selectedUser"
                    @submit="handleSubmit" />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import UserFormModal from '~/components/user-management/UserFormModal.vue'

type AdminUser = {
    id: number
    name: string
    email: string
    role: string
    status: string
    last_login: string
    created_at: string
}

const search = ref('')
const status = ref('all')

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedUser = ref<AdminUser | null>(null)

const users = ref<AdminUser[]>([
    {
        id: 1,
        name: 'Lay Admin',
        email: 'admin@ltech.digital',
        role: 'Super Admin',
        status: 'active',
        last_login: '2026-05-05',
        created_at: '2026-05-01'
    },
    {
        id: 2,
        name: 'Support User',
        email: 'support@ltech.digital',
        role: 'Support',
        status: 'inactive',
        last_login: '2026-05-03',
        created_at: '2026-04-28'
    }
])

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' }
]

const filteredUsers = computed(() => {
    return users.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.email.toLowerCase().includes(keyword) ||
            item.role.toLowerCase().includes(keyword)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

const columns: TableColumn<AdminUser>[] = [
    {
        accessorKey: 'name',
        header: 'User',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
            h('div', {
                class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary'
            }, row.original.name.charAt(0)),
            h('div', {}, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                h('p', { class: 'text-sm text-muted' }, row.original.email)
            ])
        ])
    },
    { accessorKey: 'role', header: 'Role' },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const colorMap: Record<string, 'success' | 'error' | 'neutral' | 'warning'> = {
                active: 'success',
                inactive: 'neutral',
                suspended: 'error',
                pending: 'warning'
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
    { accessorKey: 'last_login', header: 'Last Login' },
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
                        label: row.original.status === 'active' ? 'Suspend' : 'Activate',
                        icon: row.original.status === 'active' ? 'i-lucide-ban' : 'i-lucide-check-circle',
                        onSelect: () => toggleStatus(row.original)
                    }
                ],
                [
                    {
                        label: 'Delete',
                        icon: 'i-lucide-trash',
                        color: 'error',
                        onSelect: () => deleteUser(row.original)
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
    selectedUser.value = null
    isModalOpen.value = true
}

function openEditModal(user: AdminUser) {
    modalType.value = 'edit'
    selectedUser.value = user
    isModalOpen.value = true
}

function handleSubmit(payload: AdminUser) {
    if (modalType.value === 'create') {
        users.value.unshift({
            ...payload,
            id: Date.now(),
            last_login: '-',
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const current = users.value.find((item) => item.id === payload.id)
        if (!current) return

        current.name = payload.name
        current.email = payload.email
        current.role = payload.role
        current.status = payload.status
    }

    isModalOpen.value = false
}

function toggleStatus(user: AdminUser) {
    const current = users.value.find((item) => item.id === user.id)
    if (!current) return

    current.status = current.status === 'active' ? 'suspended' : 'active'
}

function deleteUser(user: AdminUser) {
    users.value = users.value.filter((item) => item.id !== user.id)
}
</script>