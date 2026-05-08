<template>
    <UDashboardPanel id="admin-users">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Admin Users</h3>
                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline"
                                    @click="getUsers" />
                                <UButton icon="i-lucide-user-plus" label="Create User" @click="openCreateModal" />
                            </div>
                        </div>
                    </template>

                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search user..."
                            class="w-full sm:max-w-sm" @keyup.enter="getUsers" />

                        <USelect v-model="status" :items="statusItems" class="w-44" />
                    </div>

                    <AdminTable :data="users" :columns="columns" :total="total" :page="page" :page-size="pageSize"
                        @update:page="page = $event" />
                </UCard>

                <UserFormModal v-model:open="isModalOpen" :type="modalType" :user="selectedUser" :roles="roles"
                    @submit="handleSubmit" />
            </div>
        </template>
    </UDashboardPanel>
</template>
<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import AdminTable from '~/components/user-management/AdminTable.vue'
import UserFormModal from '~/components/user-management/UserFormModal.vue'
import { UserStatus, type AdminUser, type RoleOption } from '~/types/admin'
definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.USER,
})
const api = useApiFetch()
const toast = useToast()

const search = ref('')
const status = ref('all')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedUser = ref<AdminUser | null>(null)

const users = ref<AdminUser[]>([])
const roles = ref<RoleOption[]>([])

// replace this with auth user_type_id
const userTypeId = ref(1)

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' }
]

async function getUsers() {
    const res: any = await api.paginate('/user', {
        page: page.value,
        table_size: pageSize.value,
        filter: {
            search: search.value,
            status: status.value
        },
        sort_by: 'id',
        sort_type: 'desc'
    })

    users.value = res.data || res.users || []
    total.value = res.total || res.meta?.total || 0
}

async function getAllRole() {
    const res: any = await api.get(`/user/get_role/${userTypeId.value}`)

    const data = res.data || res.roles || res || []

    roles.value = data.map((item: any) => ({
        label: item.role_name
            ? item.role_name.replaceAll('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            : '-',
        value: item.id
    }))
}

onMounted(async () => {
    await Promise.all([getUsers(), getAllRole()])
})

watch([page, status], getUsers)

async function handleSubmit(payload: AdminUser) {
    const body: any = { ...payload }

    if (modalType.value === 'edit' && !body.password) {
        delete body.password
        delete body.password_confirmation
    }

    if (modalType.value === 'create') {
        await api.post('/user', body)
        toast.add({ title: 'User created', color: 'success' })
    } else {
        await api.put(`/user/${payload.id}`, body)
        toast.add({ title: 'User updated', color: 'success' })
    }

    isModalOpen.value = false
    await getUsers()
}

async function deleteUser(user: AdminUser) {
    await api.delete(`/user/${user.id}`)

    toast.add({
        title: 'User deleted',
        color: 'success'
    })

    await getUsers()
}

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

const columns: TableColumn<AdminUser>[] = [
    {
        accessorKey: 'full_name',
        header: 'User',
        cell: ({ row }) =>
            h('div', { class: 'flex items-center gap-3' }, [
                h(
                    'div',
                    { class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary' },
                    row.original.full_name?.charAt(0) || 'U'
                ),
                h('div', {}, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.full_name || '-'),
                    h('p', { class: 'text-sm text-muted' }, row.original.email || '-')
                ])
            ])
    },
    {
        accessorKey: 'username',
        header: 'Username'
    },
    {
        accessorKey: 'role_name',
        header: 'Role',
        cell: ({ row }) =>
            h(resolveComponent('UBadge'), {
                color: 'neutral',
                variant: 'soft',
                class: 'capitalize'
            }, {
                default: () => row.original.role_name || '-'
            })
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
            h(resolveComponent('UBadge'), {
                color: colorMap[row.original.status],
                variant: 'soft',
                class: 'capitalize'
            }, {
                default: () => getStatusLabel(row.original.status)
            })
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) =>
            h('span', { class: 'text-sm text-muted' },
                row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'
            )
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
                        onSelect: () => openEditModal(row.original)
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
                default: () =>
                    h(resolveComponent('UButton'), {
                        icon: 'i-lucide-ellipsis',
                        color: 'neutral',
                        variant: 'ghost'
                    })
            })
        }
    }
]
function getStatusLabel(status: UserStatus) {
    switch (status) {
        case UserStatus.ACTIVE:
            return 'active'

        case UserStatus.INACTIVE:
            return 'inactive'

        case UserStatus.SUSPENDED:
            return 'suspended'

        default:
            return '-'
    }
}
const colorMap: Record<UserStatus, 'success' | 'error' | 'neutral'> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'neutral',
    [UserStatus.SUSPENDED]: 'error'
}
</script>
