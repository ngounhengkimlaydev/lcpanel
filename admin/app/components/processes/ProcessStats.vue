<template>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard>
            <p class="text-sm text-muted">Total Processes</p>
            <p class="mt-2 text-2xl font-bold">{{ processes.length }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Running</p>
            <p class="mt-2 text-2xl font-bold text-success">{{ runningCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">CPU Usage</p>
            <p class="mt-2 text-2xl font-bold">{{ totalCpu }}%</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Memory Usage</p>
            <p class="mt-2 text-2xl font-bold">{{ totalMemory }} MB</p>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { ServerProcess } from '~/types';

const props = defineProps<{
    processes: ServerProcess[]
}>()

const runningCount = computed(() => {
    return props.processes.filter((item) => item.status === 'running').length
})

const totalCpu = computed(() => {
    return props.processes.reduce((total, item) => total + item.cpu, 0).toFixed(1)
})

const totalMemory = computed(() => {
    return props.processes.reduce((total, item) => total + item.memory, 0).toFixed(1)
})
</script>