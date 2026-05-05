<template>
    <UDashboardPanel id="permissions">
        <template #header>
            <UDashboardNavbar title="Permissions">
                <template #right>
                    <UButton icon="i-lucide-key-round" label="Create Module Permission" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <UInput v-model="search" icon="i-lucide-search" placeholder="Search module permission..."
                    class="w-full sm:max-w-sm" />

                <USelect v-model="status" :items="statusItems" class="w-44" />
            </div>

            <UTable :data="filteredModules" :columns="columns" />

            <PermissionModuleModal v-model:open="isModalOpen" :type="modalType" :module-permission="selectedModule"
                @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import PermissionModuleModal from '~/components/user-management/PermissionModuleModal.vue'


type ModulePermission = {
    id: number
    module_name: string
    module_key: string
    description: string
    status: string
    permissions: string[]
    created_at: string
}

const search = ref('')
const status = ref('all')

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedModule = ref<ModulePermission | null>(null)

const modulePermissions = ref<ModulePermission[]>([
    {
        id: 1,
        module_name: 'Customers',
        module_key: 'customers',
        description: 'Manage customer accounts and profile access.',
        status: 'active',
        permissions: ['view', 'create', 'update', 'delete'],
        created_at: '2026-05-01'
    },
    {
        id: 2,
        module_name: 'Invoices',
        module_key: 'invoices',
        description: 'Manage billing invoices and payment records.',
        status: 'active',
        permissions: ['view', 'create', 'update', 'delete', 'download'],
        created_at: '2026-05-02'
    }
])

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
]

const filteredModules = computed(() => {
    return modulePermissions.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.module_name.toLowerCase().includes(keyword) ||
            item.module_key.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

const columns: TableColumn<ModulePermission>[] = [
    {
        accessorKey: 'module_name',
        header: 'Module',
        cell: ({ row }) => h('div', {}, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.module_name),
            h('p', { class: 'text-sm text-muted' }, row.original.module_key)
        ])
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => h('div', { class: 'flex flex-wrap gap-1.5' },
            row.original.permissions.slice(0, 4).map((permission) =>
                h(resolveComponent('UBadge'), {
                    color: 'primary',
                    variant: 'soft',
                    class: 'capitalize'
                }, {
                    default: () => permission
                })
            ).concat(
                row.original.permissions.length > 4
                    ? [
                        h(resolveComponent('UBadge'), {
                            color: 'neutral',
                            variant: 'soft'
                        }, {
                            default: () => `+${row.original.permissions.length - 4}`
                        })
                    ]
                    : []
            )
        )
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
                        onSelect: () => deleteModule(row.original)
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
    selectedModule.value = null
    isModalOpen.value = true
}

function openEditModal(module: ModulePermission) {
    modalType.value = 'edit'
    selectedModule.value = module
    isModalOpen.value = true
}

function handleSubmit(payload: ModulePermission) {
    if (modalType.value === 'create') {
        modulePermissions.value.unshift({
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const current = modulePermissions.value.find((item) => item.id === payload.id)
        if (!current) return

        current.module_name = payload.module_name
        current.module_key = payload.module_key
        current.description = payload.description
        current.status = payload.status
        current.permissions = payload.permissions
    }

    isModalOpen.value = false
}

function toggleStatus(module: ModulePermission) {
    const current = modulePermissions.value.find((item) => item.id === module.id)
    if (!current) return

    current.status = current.status === 'active' ? 'inactive' : 'active'
}

function deleteModule(module: ModulePermission) {
    modulePermissions.value = modulePermissions.value.filter((item) => item.id !== module.id)
}
</script>