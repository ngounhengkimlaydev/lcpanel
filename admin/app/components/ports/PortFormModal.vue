<template>
    <UModal v-model:open="openModel" :title="type === 'create' ? 'Add Port' : 'Edit Port'">
        <template #body>
            <div class="space-y-4">
                <UFormField label="Port">
                    <UInput v-model.number="form.port" type="number" placeholder="80" />
                </UFormField>

                <UFormField label="Protocol">
                    <USelect v-model="form.protocol" :items="protocolItems" />
                </UFormField>

                <UFormField label="Service">
                    <UInput v-model="form.service" placeholder="HTTP" />
                </UFormField>

                <UFormField label="Description">
                    <UTextarea v-model="form.description" placeholder="Port description..." />
                </UFormField>

                <UFormField label="Status">
                    <USelect v-model="form.status" :items="statusItems" />
                </UFormField>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="openModel = false" />

                <UButton :label="type === 'create' ? 'Create Port' : 'Save Changes'" icon="i-lucide-save"
                    @click="submit" />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { Port } from '~/types';


const emit = defineEmits<{
    submit: [port: Port]
}>()

const props = defineProps<{
    type: 'create' | 'edit'
    port: Port | null
}>()

const openModel = defineModel<boolean>('open', { default: false })

const form = reactive<Port>({
    id: 0,
    port: 80,
    protocol: 'TCP',
    service: '',
    description: '',
    status: 'open',
    created_at: ''
})

const protocolItems = [
    { label: 'TCP', value: 'TCP' },
    { label: 'UDP', value: 'UDP' }
]

const statusItems = [
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Filtered', value: 'filtered' }
]

watch(
    () => props.port,
    (value) => {
        if (value) {
            Object.assign(form, value)
        } else {
            Object.assign(form, {
                id: 0,
                port: 80,
                protocol: 'TCP',
                service: '',
                description: '',
                status: 'open',
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