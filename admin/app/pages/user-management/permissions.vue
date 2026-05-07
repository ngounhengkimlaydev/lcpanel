<template>
    <UDashboardPanel id="permissions">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Permission
                            </h3>
                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline"
                                    @click="loadModulePermissions" />
                                <UButton icon="i-lucide-key-round" label="Create Module Permission"
                                    @click="openCreateModal" />
                            </div>
                        </div>
                    </template>
                    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search module permission..."
                            class="w-full sm:max-w-sm" />
                    </div>
                    <PermissionTable :data="modulePermissions" :columns="columns" :total="total" :page="page"
                        :page-size="pageSize" @update:page="page = $event" />
                </UCard>
            </div>
            <PermissionModuleModal v-model:open="isModalOpen" :type="modalType" :module-permission="selectedModule"
                @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import ConfirmModal from '~/components/ConfirmModal.vue'
import PermissionModuleModal from '~/components/user-management/PermissionModuleModal.vue'
import PermissionTable from '~/components/user-management/PermissionTable.vue'
import type { ModulePermission } from '~/types'


const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedModule = ref<ModulePermission | null>(null)
const fetch = useApiFetch()
const overlay = useOverlay()
const modulePermissions = ref<ModulePermission[]>([])

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)


const loadModulePermissions = async () => {
    const res = await fetch.paginate('/module', {
        page: page.value,
        table_size: pageSize.value,
        filter: {
            search: search.value
        },
        sort_by: 'module_name',
        sort_type: 'asc'
    })

    modulePermissions.value = res?.data ?? []
    total.value = res?.total ?? res?.pagination?.total ?? 0
}

const debouncedSearch = useDebounceFn(() => {
    page.value = 1
    loadModulePermissions()
}, 400)

watch(page, () => {
    loadModulePermissions()
})

watch(search, () => {
    debouncedSearch()
})

onMounted(() => {
    loadModulePermissions()
})


const columns: TableColumn<ModulePermission>[] = [
    {
        accessorKey: 'no',
        header: 'No.',
        cell: ({ row }) =>
            h(
                'p',
                { class: 'font-medium text-highlighted' },
                row.index + 1
            )
    },
    {
        accessorKey: 'module_name',
        header: 'Module',
        cell: ({ row }) => h('div', {}, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.module_name),
        ])
    },
    {
        accessorKey: 'module_key',
        header: 'Module Key',
        cell: ({ row }) => h('div', {}, [
            h('p', { class: 'font-medium text-highlighted' }, row.original.module_key),
        ])
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'flex flex-wrap gap-1.5' },
                row.original.permissions
                    .slice(0, 4)
                    .map((permission) =>
                        h(resolveComponent('UBadge'), {
                            color: 'primary',
                            variant: 'soft',
                            class: 'capitalize'
                        }, {
                            default: () => permission.permission_name
                        })
                    )
                    .concat(
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

async function handleSubmit(payload: ModulePermission) {
    const body = {
        module_name: payload.module_name,
        module_key: payload.module_key,
        permission: payload.permissions
    }

    if (modalType.value === 'create') {
        await fetch.post('/module', body)
    } else {
        await fetch.put(`/module/${payload.id}`, body)
    }

    isModalOpen.value = false
    selectedModule.value = null

    await loadModulePermissions()
}

async function deleteModule(module: ModulePermission) {

    const modal = overlay.create(ConfirmModal, {
        props: {
            title: 'Delete Module',
            description: `Are you sure you want to delete "${module.module_name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            color: 'error'
        }
    })

    const instance = modal.open()

    const confirmed = await instance.result

    if (!confirmed) return

    try {
        await fetch.delete(`/module/${module.id}`)

        modulePermissions.value = modulePermissions.value.filter(
            (item) => item.id !== module.id
        )

        useToast().add({
            title: 'Success',
            description: 'Module deleted successfully',
            color: 'success'
        })
    } catch (error) {
        useToast().add({
            title: 'Error',
            description: 'Failed to delete module',
            color: 'error'
        })
    }
}
</script>