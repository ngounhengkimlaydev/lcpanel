<template>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard>
            <p class="text-sm text-muted">Total Ports</p>
            <p class="mt-2 text-2xl font-bold">{{ ports.length }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Open</p>
            <p class="mt-2 text-2xl font-bold text-success">{{ openCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Closed</p>
            <p class="mt-2 text-2xl font-bold text-error">{{ closedCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Filtered</p>
            <p class="mt-2 text-2xl font-bold text-warning">{{ filteredCount }}</p>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { Port } from '~/types';


const props = defineProps<{
    ports: Port[]
}>()

const openCount = computed(() => props.ports.filter((item) => item.status === 'open').length)
const closedCount = computed(() => props.ports.filter((item) => item.status === 'closed').length)
const filteredCount = computed(() => props.ports.filter((item) => item.status === 'filtered').length)
</script>