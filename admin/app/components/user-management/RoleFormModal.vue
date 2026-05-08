<template>
    <UModal v-model:open="open" fullscreen>
        <template #content>
            <UForm :schema="schema" :state="form" class="fixed inset-0 flex flex-col overflow-hidden bg-default"
                @submit="submit">
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

                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="closeModal" />
                </div>

                <div class="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[380px_1fr]">
                    <aside class="sticky top-0 border-b border-default p-6 lg:border-b-0 lg:border-r">
                        <div class="space-y-4">
                            <UFormField label="Role Name" name="name" required>
                                <UInput v-model="form.role_name" icon="i-lucide-shield" placeholder="Role name"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Description" name="description">
                                <UTextarea v-model="form.description" placeholder="Role description..." class="w-full"
                                    :rows="5" />
                            </UFormField>

                            <UFormField label="User Type" name="user_type_id" required>
                                <USelect v-model="form.user_type_id" :items="userTypeOptions"
                                    placeholder="Select user type" class="w-full" />
                            </UFormField>

                            <UFormField name="permissions">
                                <div class="rounded-2xl border border-default bg-elevated/40 p-4">
                                    <p class="text-sm font-semibold text-highlighted">Selected Permissions</p>
                                    <p class="mt-1 text-3xl font-black text-highlighted">
                                        {{ form.permissions.length }}
                                    </p>
                                    <p class="text-sm text-muted">permissions enabled for this role</p>
                                </div>
                            </UFormField>
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
                                    variant="outline" :disabled="!permissionModules.length" @click="selectAll" />

                                <UButton label="Clear" icon="i-lucide-eraser" color="neutral" variant="outline"
                                    @click="clearAll" />
                            </div>
                        </div>

                        <div v-if="isLoadingPermissions" class="py-16 text-center text-sm text-muted">
                            Loading permissions...
                        </div>

                        <div v-else-if="!permissionModules.length" class="py-16 text-center">
                            <UIcon name="i-lucide-shield-alert" class="mx-auto mb-3 size-10 text-muted" />
                            <p class="font-medium text-highlighted">No permission found</p>
                            <p class="text-sm text-muted">Please select a user type first.</p>
                        </div>

                        <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div v-for="module in permissionModules" :key="module.id"
                                class="rounded-2xl border border-default bg-elevated/40 p-5">
                                <div class="mb-4 flex items-start justify-between gap-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <UIcon name="i-lucide-box" class="size-5" />
                                        </div>

                                        <div>
                                            <p class="font-bold text-highlighted">
                                                {{ module.module_name }}
                                            </p>
                                            <p class="text-sm text-muted">
                                                {{ module.module_key }}
                                            </p>
                                        </div>
                                    </div>

                                    <UBadge color="neutral" variant="soft">
                                        {{ countModuleSelected(module.module_key) }}/{{ module.permissions.length }}
                                    </UBadge>
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <button v-for="permission in module.permissions" :key="permission.id" type="button"
                                        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition"
                                        :class="hasPermission(`${module.module_key}.${permission.permission_name}`)
                                            ? 'border-primary/30 bg-primary/10 text-primary'
                                            : 'border-default bg-default text-muted hover:bg-elevated hover:text-highlighted'
                                            "
                                        @click="togglePermission(`${module.module_key}.${permission.permission_name}`)">
                                        <UIcon :name="hasPermission(`${module.module_key}.${permission.permission_name}`)
                                            ? 'i-lucide-check'
                                            : 'i-lucide-plus'
                                            " class="size-3.5" />

                                        {{ permission.permission_name }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <div class="shrink-0 flex items-center justify-end gap-2 border-t border-default px-6 py-4">
                    <UButton label="Cancel" color="neutral" variant="ghost" @click="closeModal" />

                    <UButton type="submit" :label="type === 'create' ? 'Create Role' : 'Save Changes'"
                        icon="i-lucide-save" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Role } from '~/types'

type Permission = {
    id: number
    permission_name: string
}

type PermissionModule = {
    id: number
    module_name: string
    module_key: string
    permissions: Permission[]
}

const props = defineProps<{
    type: 'create' | 'edit'
    role: Role | null
}>()

const emit = defineEmits<{
    submit: [role: Role]
}>()

const open = defineModel<boolean>('open', { default: false })

const api = useApiFetch()
const userStore = useUserStore()

const isLoadingPermissions = ref(false)
const permissionModules = ref<PermissionModule[]>([])

const schema = z.object({
    id: z.number().optional(),
    role_name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
    user_type_id: z.number().min(1, 'User type is required'),
    permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
    created_at: z.string().optional(),
})

type Schema = z.output<typeof schema>

const form = reactive<Schema>({
    id: 0,
    role_name: null,
    description: '',
    user_type_id: null,
    permissions: [],
    created_at: '',
})

const userTypeOptions = computed(() =>
    userStore.userTypes.map((item) => ({
        label: item.type,
        value: item.id,
    }))
)

const allPermissions = computed(() =>
    permissionModules.value.flatMap((module) =>
        module.permissions.map(
            (permission) => `${module.module_key}.${permission.permission_name}`
        )
    )
)

async function getModulePermission() {
    isLoadingPermissions.value = true

    try {
        const res: any = await api.get('/role/get_module_permission', {}, false)

        permissionModules.value =
            res?.data ||
            res?.module_permissions ||
            res?.permissions ||
            res ||
            []
    } catch (error) {
        permissionModules.value = []
    } finally {
        isLoadingPermissions.value = false
    }
}

function resetForm() {
    Object.assign(form, {
        id: 0,
        role_name: null,
        description: '',
        user_type_id: null,
        permissions: [],
        created_at: '',
    })
}

function setEditForm(data: any) {
    const selectedPermissionIds = data.role_module.map(
        (item: any) => item.permission_id
    )

    permissionModules.value = data.module_permission.map((module: any) => ({
        ...module,
        permissions: module.permissions.map((permission: any) => ({
            ...permission,
            checked: selectedPermissionIds.includes(permission.id),
        })),
        checked: module.permissions.some((permission: any) =>
            selectedPermissionIds.includes(permission.id)
        ),
    }))

    form.id = data.role.id
    form.role_name = data.role.role_name || null
    form.description = data.role.role_desc || ''
    form.user_type_id = data.role.user_type_id || null

    form.permissions = permissionModules.value.flatMap((module: any) =>
        module.permissions
            .filter((permission: any) => permission.checked)
            .map(
                (permission: any) =>
                    `${module.module_key}.${permission.permission_name}`
            )
    )

    form.created_at = data.role.created_at || ''
}


watch(open, async (value) => {
    if (!value) return

    if (!userStore.userTypes.length) {
        await userStore.initStore()
    }

    if (props.type === 'edit' && props.role?.id) {
        const res: any = await api.get(`/role/${props.role.id}`, {}, false)

        setEditForm(res)
    } else {
        resetForm()
        await getModulePermission()
    }
})

function closeModal() {
    open.value = false
}

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

function submit(event: FormSubmitEvent<Schema>) {
    const modulePermission = permissionModules.value.map((module) => {
        const permissions = module.permissions.map((permission) => {
            const key = `${module.module_key}.${permission.permission_name}`

            return {
                ...permission,
                checked: form.permissions.includes(key),
            }
        })

        return {
            ...module,
            permissions,
            checked: permissions.some((permission) => permission.checked),
        }
    })

    emit('submit', {
        id: event.data.id || 0,
        role_name: event.data.role_name,
        user_type_id: event.data.user_type_id,
        role_module: [],
        module_permission: modulePermission,
        role_desc: event.data.description || '',
    })
}
</script>