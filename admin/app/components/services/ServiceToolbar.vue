<template>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UInput v-model="searchModel" icon="i-lucide-search" placeholder="Search services..."
            class="w-full sm:max-w-sm" />

        <USelect v-model="statusModel" :items="statusOptions"  class="w-40"/>
    </div>
</template>

<script setup lang="ts">
const searchModel = defineModel<string>('search', { default: '' })
const statusModel = defineModel<string>('status', { default: 'all' })

const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Running', value: 'running' },
    { label: 'Stopped', value: 'stopped' },
    { label: 'Failed', value: 'failed' },
    { label: 'Unknown', value: 'unknown' }
]
</script>