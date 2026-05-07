<template>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard>
            <p class="text-sm text-muted">Total Logs</p>
            <p class="mt-2 text-2xl font-bold">{{ logs.length }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Success</p>
            <p class="mt-2 text-2xl font-bold text-success">{{ successCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Warnings</p>
            <p class="mt-2 text-2xl font-bold text-warning">{{ warningCount }}</p>
        </UCard>

        <UCard>
            <p class="text-sm text-muted">Errors</p>
            <p class="mt-2 text-2xl font-bold text-error">{{ errorCount }}</p>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { ServerLog } from '~/types/log'

const props = defineProps<{
    logs: ServerLog[]
}>()

const successCount = computed(() => props.logs.filter((item) => item.level === 'success').length)
const warningCount = computed(() => props.logs.filter((item) => item.level === 'warning').length)
const errorCount = computed(() => props.logs.filter((item) => item.level === 'error').length)
</script>