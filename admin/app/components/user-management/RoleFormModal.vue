<template>
    <UModal v-model:open="open" fullscreen>
        <template #content>
            <div class="fixed inset-0 flex flex-col overflow-hidden bg-default">
                <div class="shrink-0 flex items-center justify-between border-b border-default px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon name="i-lucide-shield-check" class="size-5" />
                        </div>

                        <div>
                            <h3 class="text-lg font-bold text-highlighted">
                                {{ type === 'create' ? 'Create Role' : 'Edit Role' }}
                            </h3>
                            <p class="text-sm text-muted">
                                Manage role information and module permissions.
                            </p>
                        </div>
                    </div>

                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="open = false" />
                </div>

                <div class="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[380px_1fr]">
                    <aside class="border-b border-default p-6 lg:border-b-0 lg:border-r">
                        <div class="space-y-4">
                            <UFormField label="Role Name" required>
                                <UInput v-model="form.name" icon="i-lucide-shield" placeholder="Role name"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Description">
                                <UTextarea v-model="form.description" placeholder="Role description..." class="w-full"
                                    :rows="5" />
                            </UFormField>

                            <UFormField label="Status">
                                <USelect v-model="form.status" :items="statusItems" class="w-full" />
                            </UFormField>

                            <div class="rounded-2xl border border-default bg-elevated/40 p-4">
                                <p class="text-sm font-semibold text-highlighted">Selected Permissions</p>
                                <p class="mt-1 text-3xl font-black text-highlighted">{{ form.permissions.length }}</p>
                                <p class="text-sm text-muted">permissions enabled for this role</p>
                            </div>
                        </div>
                    </aside>

                    <main class="p-6">
                        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h4 class="text-base font-bold text-highlighted">Module Permissions</h4>
                                <p class="text-sm text-muted">Click badges to select permissions.</p>
                            </div>

                            <div class="flex gap-2">
                                <UButton label="Select All" icon="i-lucide-check-check" color="neutral"
                                    variant="outline" @click="selectAll" />
                                <UButton label="Clear" icon="i-lucide-eraser" color="neutral" variant="outline"
                                    @click="clearAll" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div v-for="module in permissionModules" :key="module.key"
                                class="rounded-2xl border border-default bg-elevated/40 p-5">
                                <div class="mb-4 flex items-start justify-between gap-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <UIcon :name="module.icon" class="size-5" />
                                        </div>

                                        <div>
                                            <p class="font-bold text-highlighted">{{ module.label }}</p>
                                            <p class="text-sm text-muted">{{ module.description }}</p>
                                        </div>
                                    </div>

                                    <UBadge color="neutral" variant="soft">
                                        {{ countModuleSelected(module.key) }}/{{ module.actions.length }}
                                    </UBadge>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <button v-for="action in module.actions" :key="`${module.key}.${action.value}`"
                                        type="button"
                                        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition"
                                        :class="hasPermission(`${module.key}.${action.value}`)
                                            ? 'border-primary/30 bg-primary/10 text-primary'
                                            : 'border-default bg-default text-muted hover:bg-elevated hover:text-highlighted'"
                                        @click="togglePermission(`${module.key}.${action.value}`)">
                                        <UIcon
                                            :name="hasPermission(`${module.key}.${action.value}`) ? 'i-lucide-check' : 'i-lucide-plus'"
                                            class="size-3.5" />
                                        {{ action.label }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <div class="shrink-0 flex items-center justify-end gap-2 border-t border-default px-6 py-4">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
                    <UButton :label="type === 'create' ? 'Create Role' : 'Save Changes'" icon="i-lucide-save"
                        @click="submit" />
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { Role } from '~/types';

const props = defineProps<{
    type: 'create' | 'edit'
    role: Role | null
}>()

const emit = defineEmits<{
    submit: [role: Role]
}>()

const open = defineModel<boolean>('open', { default: false })

const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
]

const permissionModules = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        description: 'Analytics and overview access',
        actions: [
            { label: 'View', value: 'view' }
        ]
    },
    {
        key: 'customers',
        label: 'Customers',
        icon: 'i-lucide-users',
        description: 'Customer account management',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' }
        ]
    },
    {
        key: 'subscriptions',
        label: 'Subscriptions',
        icon: 'i-lucide-credit-card',
        description: 'Subscription lifecycle controls',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Cancel', value: 'cancel' }
        ]
    },
    {
        key: 'invoices',
        label: 'Invoices',
        icon: 'i-lucide-receipt',
        description: 'Billing and payment records',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' }
        ]
    },
    {
        key: 'plans',
        label: 'Hosting Plans',
        icon: 'i-lucide-package',
        description: 'Plan and pricing management',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' }
        ]
    },
    {
        key: 'users',
        label: 'Admin Users',
        icon: 'i-lucide-user-cog',
        description: 'Admin account access',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' }
        ]
    },
    {
        key: 'roles',
        label: 'Roles',
        icon: 'i-lucide-shield-check',
        description: 'Role and permission settings',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' }
        ]
    },
    {
        key: 'activity_logs',
        label: 'Activity Logs',
        icon: 'i-lucide-history',
        description: 'System activity audit history',
        actions: [
            { label: 'View', value: 'view' },
            { label: 'Export', value: 'export' }
        ]
    }
]

const form = reactive<Role>({
    id: 0,
    name: '',
    description: '',
    users: 0,
    status: 'active',
    permissions: [],
    created_at: ''
})

const allPermissions = computed(() => {
    return permissionModules.flatMap((module) =>
        module.actions.map((action) => `${module.key}.${action.value}`)
    )
})

watch(open, (value) => {
    if (!value) return

    if (props.type === 'edit' && props.role) {
        Object.assign(form, {
            ...props.role,
            permissions: [...props.role.permissions]
        })
    } else {
        Object.assign(form, {
            id: 0,
            name: '',
            description: '',
            users: 0,
            status: 'active',
            permissions: [],
            created_at: ''
        })
    }
})

function hasPermission(permission: string) {
    return form.permissions.includes(permission)
}

function togglePermission(permission: string) {
    if (form.permissions.includes(permission)) {
        form.permissions = form.permissions.filter((item) => item !== permission)
        return
    }

    form.permissions.push(permission)
}

function countModuleSelected(moduleKey: string) {
    return form.permissions.filter((item) => item.startsWith(`${moduleKey}.`)).length
}

function selectAll() {
    form.permissions = [...allPermissions.value]
}

function clearAll() {
    form.permissions = []
}

function submit() {
    emit('submit', { ...form, permissions: [...form.permissions] })
}
</script>