<template>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <UCard v-for="item in stats" :key="item.label">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-muted">{{ item.label }}</p>
                    <p class="mt-1 text-2xl font-bold text-highlighted">{{ item.value }}</p>
                </div>

                <div class="rounded-xl bg-muted p-3">
                    <UIcon :name="item.icon" class="size-5 text-muted" />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const stats = [
    {
        label: 'Total Apps',
        value: 8,
        icon: 'i-lucide-terminal'
    },
    {
        label: 'Running',
        value: 5,
        icon: 'i-lucide-circle-play'
    },
    {
        label: 'Stopped',
        value: 2,
        icon: 'i-lucide-circle-stop'
    },
    {
        label: 'Errors',
        value: 1,
        icon: 'i-lucide-triangle-alert'
    }
]
</script>