<template>
    <div class="grid gap-4 ">
        <UCard v-for="item in stats" :key="item.label">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-muted">
                        {{ item.label }}
                    </p>
                    <p class="mt-1 text-2xl font-semibold text-highlighted">
                        {{ item.value }}
                    </p>
                </div>

                <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UIcon :name="item.icon" class="size-5" />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { SystemService } from '~/types';


const props = defineProps<{
    services: SystemService[]
}>()

const stats = computed(() => [
    {
        label: 'Total Services',
        value: props.services.length,
        icon: 'i-lucide-server'
    },
    {
        label: 'Running',
        value: props.services.filter(item => item.status === 'running').length,
        icon: 'i-lucide-circle-play'
    },
    {
        label: 'Stopped',
        value: props.services.filter(item => item.status === 'stopped').length,
        icon: 'i-lucide-circle-stop'
    },
    {
        label: 'Auto Start',
        value: props.services.filter(item => item.auto_start).length,
        icon: 'i-lucide-power'
    }
])
</script>