<template>
    <UModal v-model:open="open">
        <template #content>
            <div
                class="flex max-h-[90dvh]  max-w-3xl flex-col overflow-hidden rounded-2xl bg-default shadow-xl ring ring-default">
                <!-- Header -->
                <div class="shrink-0 border-b border-default p-6">
                    <div class="flex items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon name="i-lucide-key-round" class="size-5" />
                        </div>

                        <div>
                            <h3 class="text-lg font-bold text-highlighted">
                                {{ type === 'create' ? 'Create Module Permission' : 'Edit Module Permission' }}
                            </h3>
                            <p class="text-sm text-muted">
                                One module can contain many permissions.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="min-h-0 flex-1 overflow-y-auto p-6">
                    <div class="space-y-5">
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <UFormField label="Module Name" required>
                                <UInput v-model="form.module_name" icon="i-lucide-box" placeholder="Customers"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Module Key" required>
                                <UInput v-model="form.module_key" icon="i-lucide-code" placeholder="customers"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <div class="rounded-2xl border border-default bg-elevated/40 p-4">
                            <div class="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p class="font-bold text-highlighted">Permissions</p>
                                    <p class="text-sm text-muted">Click badges to add or remove permissions.</p>
                                </div>

                                <UBadge color="primary" variant="soft">
                                    {{ form.permissions.length }} selected
                                </UBadge>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                <button v-for="permission in defaultPermissions" :key="permission.value" type="button"
                                    class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition"
                                    :class="hasPermission(permission.value)
                                        ? 'border-primary/30 bg-primary/10 text-primary'
                                        : 'border-default bg-default text-muted hover:bg-elevated hover:text-highlighted'"
                                    @click="togglePermission(permission.value)">
                                    <UIcon :name="hasPermission(permission.value) ? 'i-lucide-check' : 'i-lucide-plus'"
                                        class="size-3.5" />
                                    {{ permission.label }}
                                </button>
                            </div>

                            <div v-if="form.permissions.length" class="mt-5 border-t border-default pt-4">
                                <p class="mb-2 text-sm font-semibold text-highlighted">
                                    Generated Permission Keys
                                </p>

                                <div class="flex flex-wrap gap-2">
                                    <UBadge v-for="permission in form.permissions" :key="permission.permission_name"
                                        color="neutral" variant="soft" class="font-mono">
                                        {{ permission.permission_name }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="shrink-0 border-t border-default p-6">
                    <div class="flex items-center justify-between gap-3">
                        <p class="text-xs text-muted">

                        </p>

                        <div class="flex justify-end gap-2">
                            <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />

                            <UButton :label="type === 'create' ? 'Create Module' : 'Save Changes'" icon="i-lucide-save"
                                @click="submit" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { ModulePermission } from '~/types';


type Option = {
    label: string
    value: string
}

const props = defineProps<{
    type: 'create' | 'edit'
    modulePermission: ModulePermission | null
}>()

const emit = defineEmits<{
    submit: [modulePermission: ModulePermission]
}>()

const open = defineModel<boolean>('open', { default: false })

const selectedPermission = ref<Option>()


const defaultPermissions: Option[] = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Approve', value: 'approve' },
    { label: 'Reject', value: 'reject' },
    { label: 'Cancel', value: 'cancel' },
    { label: 'Export', value: 'export' },
    { label: 'Download', value: 'download' },
    { label: 'Upload', value: 'upload' }
]


const form = reactive<ModulePermission>({
    id: 0,
    module_name: '',
    module_key: '',
    permissions: [],
    created_at: ''
})

watch(
    () => form.module_name,
    (value) => {
        if (props.type === 'edit') return

        form.module_key = value
            .toLowerCase()
            .trim()
            .replaceAll(' ', '_')
            .replace(/[^a-z0-9_]/g, '')
    }
)

watch(open, (value) => {
    if (!value) return

    selectedPermission.value = undefined

    if (props.type === 'edit' && props.modulePermission) {
        Object.assign(form, {
            ...props.modulePermission,
            permissions: [...props.modulePermission.permissions]
        })
    } else {
        Object.assign(form, {
            id: 0,
            module_name: '',
            module_key: '',
            permissions: [],
            created_at: ''
        })
    }
})

function hasPermission(permission: string) {
    return form.permissions.some(
        (item) => item.permission_name === permission
    )
}

function togglePermission(permission: string) {
    const exists = form.permissions.some(
        (item) => item.permission_name === permission
    )

    if (exists) {
        form.permissions = form.permissions.filter(
            (item) => item.permission_name !== permission
        )

        form.permissions = form.permissions.map((item, index) => ({
            ...item,
            index
        }))

        return
    }

    form.permissions.push({
        index: form.permissions.length,
        permission_name: permission
    })
}

function submit() {
    emit('submit', {
        ...form,
        permissions: [...form.permissions]
    })
}

function onKeydown(event: KeyboardEvent) {
    const isSave =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 's'

    if (!isSave) return

    event.preventDefault()

    submit()
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
})
</script>