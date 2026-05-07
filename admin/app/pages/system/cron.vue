<template>
    <UDashboardPanel id="cron-jobs">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Cron Jobs
                            </h3>

                            <div class="flex gap-2">
                                <UButton icon="i-lucide-chart-no-axes-column" label="View Cron Dashboard"
                                    @click="dashboard = true" />

                                <UButton icon="i-lucide-plus" label="Add Cron Job" @click="openCreateModal" />
                            </div>
                        </div>
                    </template>

                    <CronJobToolbar :search="search" :status="status" @update:search="search = $event"
                        @update:status="status = $event" />

                    <CronJobTable :cron-jobs="filteredCronJobs" @edit="openEditModal" @delete="deleteCronJob" />
                </UCard>

                <CronJobFormModal v-model:open="isModalOpen" :type="modalType" :cron-job="selectedCronJob"
                    @submit="handleSubmit" />
            </div>

            <USlideover v-model:open="dashboard" title="Cron Job Dashboard">
                <template #body>
                    <CronJobStats :cron-jobs="cronJobs" />
                </template>
            </USlideover>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import CronJobStats from '~/components/cron-jobs/CronJobStats.vue'
import CronJobTable from '~/components/cron-jobs/CronJobTable.vue'
import CronJobToolbar from '~/components/cron-jobs/CronJobToolbar.vue'
import CronJobFormModal from '~/components/cron-jobs/CronJobFormModal.vue'
import type { CronJob } from '~/types/cron-job'

definePageMeta({
    middleware: ['super-admin']
})

const search = ref('')
const status = ref('all')
const dashboard = ref(false)

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedCronJob = ref<CronJob | null>(null)

const cronJobs = ref<CronJob[]>([
    {
        id: 1,
        name: 'Database Backup',
        command: 'php artisan backup:run',
        schedule: '0 2 * * *',
        user: 'root',
        status: 'active',
        last_run: '2026-05-07 02:00',
        next_run: '2026-05-08 02:00',
        created_at: '2026-05-07'
    },
    {
        id: 2,
        name: 'Clear Cache',
        command: 'pnpm cache:clear',
        schedule: '*/30 * * * *',
        user: 'lay',
        status: 'active',
        last_run: '2026-05-07 16:30',
        next_run: '2026-05-07 17:00',
        created_at: '2026-05-07'
    },
    {
        id: 3,
        name: 'Log Cleanup',
        command: 'find /var/log -type f -name "*.log" -delete',
        schedule: '0 0 * * 0',
        user: 'root',
        status: 'paused',
        last_run: '2026-05-03 00:00',
        next_run: '-',
        created_at: '2026-05-07'
    }
])

const filteredCronJobs = computed(() => {
    return cronJobs.value.filter((item) => {
        const matchSearch =
            item.name.toLowerCase().includes(search.value.toLowerCase()) ||
            item.command.toLowerCase().includes(search.value.toLowerCase()) ||
            item.user.toLowerCase().includes(search.value.toLowerCase()) ||
            item.schedule.toLowerCase().includes(search.value.toLowerCase())

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedCronJob.value = null
    isModalOpen.value = true
}

function openEditModal(cronJob: CronJob) {
    modalType.value = 'edit'
    selectedCronJob.value = cronJob
    isModalOpen.value = true
}

function handleSubmit(payload: CronJob) {
    if (modalType.value === 'create') {
        cronJobs.value.unshift({
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const index = cronJobs.value.findIndex((item) => item.id === payload.id)

        if (index !== -1) {
            cronJobs.value[index] = payload
        }
    }

    isModalOpen.value = false
}

function deleteCronJob(cronJob: CronJob) {
    cronJobs.value = cronJobs.value.filter((item) => item.id !== cronJob.id)
}
</script>