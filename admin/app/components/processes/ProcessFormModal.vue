<template>
    <UModal v-model:open="openModel" :title="type === 'create' ? 'Add Process' : 'Edit Process'">
        <template #body>
            <div class="space-y-4">
                <UFormField label="PID">
                    <UInput v-model.number="form.pid" type="number" placeholder="1234" />
                </UFormField>

                <UFormField label="Name">
                    <UInput v-model="form.name" placeholder="nginx" />
                </UFormField>

                <UFormField label="User">
                    <UInput v-model="form.user" placeholder="root" />
                </UFormField>

                <div class="grid gap-4 md:grid-cols-2">
                    <UFormField label="CPU (%)">
                        <UInput v-model.number="form.cpu" type="number" placeholder="1.5" />
                    </UFormField>

                    <UFormField label="Memory (MB)">
                        <UInput v-model.number="form.memory" type="number" placeholder="128" />
                    </UFormField>
                </div>

                <UFormField label="Status">
                    <USelect v-model="form.status" :items="statusItems" />
                </UFormField>

                <UFormField label="Uptime">
                    <UInput v-model="form.uptime" placeholder="2h 10m" />
                </UFormField>

                <UFormField label="Command">
                    <UTextarea v-model="form.command" placeholder="node dist/main.js" />
                </UFormField>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="openModel = false" />

                <UButton :label="type === 'create' ? 'Create Process' : 'Save Changes'" icon="i-lucide-save"
                    @click="submit" />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { ServerProcess } from '~/types';


const emit = defineEmits<{
    submit: [process: ServerProcess]
}>()

const props = defineProps<{
    type: 'create' | 'edit'
    process: ServerProcess | null
}>()

const openModel = defineModel<boolean>('open', { default: false })

const form = reactive<ServerProcess>({
    id: 0,
    pid: 0,
    name: '',
    user: '',
    cpu: 0,
    memory: 0,
    status: 'running',
    uptime: '',
    command: '',
    created_at: ''
})

const statusItems = [
    { label: 'Running', value: 'running' },
    { label: 'Stopped', value: 'stopped' },
    { label: 'Sleeping', value: 'sleeping' },
    { label: 'Error', value: 'error' }
]

watch(
    () => props.process,
    (value) => {
        if (value) {
            Object.assign(form, value)
        } else {
            Object.assign(form, {
                id: 0,
                pid: 0,
                name: '',
                user: '',
                cpu: 0,
                memory: 0,
                status: 'running',
                uptime: '',
                command: '',
                created_at: ''
            })
        }
    },
    { immediate: true }
)

function submit() {
    emit('submit', { ...form })
}
</script>