<template>
    <UDashboardPanel id="roles">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                User Roles
                            </h3>
                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline"
                                    @click="getRoles" />
                                <UButton icon="i-lucide-shield-plus" label="Create Role" @click="openCreateModal" />
                            </div>
                        </div>
                    </template>
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search role..."
                            class="w-full sm:max-w-sm" />
                        <!-- <USelect v-model="status" :items="" class="w-44" /> -->
                    </div>
                    <RoleTable :data="filteredRoles" :columns="columns" :total="total" :page="page"
                        :page-size="pageSize" @update:page="page = $event" />
                </UCard>
            </div>
            <RoleFormModal v-model:open="isModalOpen" :type="modalType" :role="selectedRole" @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import RoleFormModal from '~/components/user-management/RoleFormModal.vue'
import RoleTable from '~/components/user-management/RoleTable.vue'
import type { Role } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.ROLE,
})

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedRole = ref<Role | null>(null)

const api = useApiFetch()
const toast = useToast()


const roles = ref<Role[]>([])

async function getRoles() {
    const res: any = await api.paginate('/role', {
        page: page.value,
        table_size: pageSize.value,
        filter: {
            search: search.value,
        },
        sort_by: 'id',
        sort_type: 'desc',
    })

    roles.value = res.data || res.roles || []
    total.value = res.total || res.meta?.total || 0
}

onMounted(getRoles)

async function deleteRole(role: Role) {
    await api.delete(`/role/${role.id}`)

    toast.add({
        title: 'Role deleted',
        color: 'success',
    })

    await getRoles()
}



async function handleSubmit(payload: Role) {
    if (modalType.value === 'create') {
        await api.post('/role', payload)
    } else {
        await api.put(`/role/${payload.id}`, payload)
    }

    isModalOpen.value = false
    await getRoles()
}


const filteredRoles = computed(() => {
    return roles.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.role_name!.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)


        return matchSearch
    })
})

const columns: TableColumn<Role>[] = [
    {
        accessorKey: 'role_name',
        header: 'Role',
        cell: ({ row }) => {
            const formatText = (value?: string) => {
                if (!value) return '-'

                return value
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase())
            }

            return h('div', {}, [
                h(
                    'p',
                    { class: 'font-medium text-highlighted' },
                    formatText(row.original.role_name!)
                ),
                h(
                    'p',
                    { class: 'text-sm text-muted line-clamp-1' },
                    formatText(row.original.user_type)
                )
            ])
        }
    },
    {
        accessorKey: 'user_type',
        header: 'User Type',
        cell: ({ row }) =>
            h(resolveComponent('UBadge'), {
                color: 'neutral',
                variant: 'soft',
                class: 'capitalize'
            }, {
                default: () => row.original.user_type || '-'
            })
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
            const date = row.original.created_at
                ? new Date(row.original.created_at).toLocaleDateString()
                : '-'

            return h('span', { class: 'text-sm text-muted' }, date)
        }
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
                        onSelect: () => deleteRole(row.original)
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



// function toggleStatus(role: Role) {
//     const current = roles.value.find((item) => item.id === role.id)
//     if (!current) return

//     current.status = current.status === 'active' ? 'inactive' : 'active'
// }

</script>
