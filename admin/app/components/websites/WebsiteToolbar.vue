<template>
    <div class="flex flex-col gap-3 border-b border-default pb-4 sm:flex-row sm:items-center sm:justify-between">
        <UInput :model-value="search" icon="i-lucide-search" placeholder="Search website, domain or owner..." :ui="{
            root: 'w-full',
            base: 'w-full sm:w-90'
        }" @update:model-value="$emit('update:search', String($event))" />

        <div class="flex items-center gap-2">
            <USelect :model-value="status" :items="statusItems" :ui="{ base: 'w-40' }"
                @update:model-value="$emit('update:status', String($event))" />

            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" />
            <UButton icon="i-lucide-download" color="neutral" variant="outline" />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    search: string
    status: string
}>()

defineEmits<{
    'update:search': [value: string]
    'update:status': [value: string]
}>()

const statusItems = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Pending', value: 'pending' },
    { label: 'Error', value: 'error' }
]
</script>