<template>
    <UModal v-model:open="openModel" :title="type === 'create' ? 'Add Cron Job' : 'Edit Cron Job'">
        <template #body>
            <div class="space-y-4">
                <UFormField label="Name">
                    <UInput v-model="form.name" placeholder="Database Backup" />
                </UFormField>

                <UFormField label="Command">
                    <UTextarea v-model="form.command" placeholder="php artisan backup:run" />
                </UFormField>

                <UFormField label="Schedule">
                    <UInput v-model="form.schedule" placeholder="0 2 * * *" />
                </UFormField>

                <UFormField label="User">
                    <UInput v-model="form.user" placeholder="root" />
                </UFormField>

                <UFormField label="Status">
                    <USelect v-model="form.status" :items="statusItems" />
                </UFormField>

                <div class="grid gap-4 md:grid-cols-2">
                    <UFormField label="Last Run">
                        <UInput v-model="form.last_run" placeholder="2026-05-07 02:00" />
                    </UFormField>

                    <UFormField label="Next Run">
                        <UInput v-model="form.next_run" placeholder="2026-05-08 02:00" />
                    </UFormField>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="openModel = false" />

                <UButton :label="type === 'create' ? 'Create Cron Job' : 'Save Changes'" icon="i-lucide-save"
                    @click="submit" />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { CronJob } from '~/types/cron-job'

const emit = defineEmits<{
    submit: [cronJob: CronJob]
}>()

const props = defineProps<{
    type: 'create' | 'edit'
    cronJob: CronJob | null
}>()

const openModel = defineModel<boolean>('open', { default: false })

const form = reactive<CronJob>({
    id: 0,
    name: '',
    command: '',
    schedule: '* * * * *',
    user: 'root',
    status: 'active',
    last_run: '-',
    next_run: '-',
    created_at: ''
})

const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Failed', value: 'failed' }
]

watch(
    () => props.cronJob,
    (value) => {
        if (value) {
            Object.assign(form, value)
        } else {
            Object.assign(form, {
                id: 0,
                name: '',
                command: '',
                schedule: '* * * * *',
                user: 'root',
                status: 'active',
                last_run: '-',
                next_run: '-',
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