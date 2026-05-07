<template>
    <div class="flex gap-3 justify-between">
        <div class="w-full md:max-w-sm">
            <UInput v-model="searchModel" icon="i-lucide-search" placeholder="Search port, service or description..." />
        </div>
        <div class="flex gap-2">
            <USelect v-model="statusModel" :items="statusItems" class="w-36" />

            <USelect v-model="protocolModel" :items="protocolItems" class="w-36" />
        </div>
    </div>
</template>

<script setup lang="ts">
const searchModel = defineModel<string>('search', { default: '' })
const statusModel = defineModel<string>('status', { default: 'all' })
const protocolModel = defineModel<string>('protocol', { default: 'all' })

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Filtered', value: 'filtered' }
]

const protocolItems = [
    { label: 'All Protocol', value: 'all' },
    { label: 'TCP', value: 'TCP' },
    { label: 'UDP', value: 'UDP' }
]
</script>