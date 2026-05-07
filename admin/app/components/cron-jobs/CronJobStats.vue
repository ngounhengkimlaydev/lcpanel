<template>
    <div class="grid gap-4">
        <UCard>
            <p class="text-sm text-muted">Total Cron Jobs</p>
            <p class="mt-2 text-2xl font-bold">{{ cronJobs.length }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Active</p>
            <p class="mt-2 text-2xl font-bold text-success">{{ activeCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Paused</p>
            <p class="mt-2 text-2xl font-bold text-warning">{{ pausedCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Failed</p>
            <p class="mt-2 text-2xl font-bold text-error">{{ failedCount }}</p>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { CronJob } from '~/types/cron-job'

const props = defineProps<{
    cronJobs: CronJob[]
}>()

const activeCount = computed(() => props.cronJobs.filter((item) => item.status === 'active').length)
const pausedCount = computed(() => props.cronJobs.filter((item) => item.status === 'paused').length)
const failedCount = computed(() => props.cronJobs.filter((item) => item.status === 'failed').length)
</script>