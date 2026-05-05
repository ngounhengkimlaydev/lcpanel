<template>
    <div class="rounded-2xl border border-default bg-elevated/40 p-5">
        <div class="flex items-start justify-between gap-4">
            <div>
                <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-highlighted">{{ plan.name }}</h3>
                    <UBadge :color="statusColor" variant="soft" class="capitalize">
                        {{ plan.status }}
                    </UBadge>
                </div>

                <p class="mt-1 text-sm text-muted">
                    {{ plan.customers }} active customers
                </p>
            </div>

            <UDropdownMenu :items="items">
                <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
            </UDropdownMenu>
        </div>

        <div class="mt-5">
            <span class="text-4xl font-black text-highlighted">${{ plan.price }}</span>
            <span class="text-sm text-muted">/month</span>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
            <div v-for="feature in features" :key="feature.label" class="rounded-xl bg-muted/40 p-3">
                <div class="flex items-center gap-2 text-sm text-muted">
                    <UIcon :name="feature.icon" class="size-4" />
                    {{ feature.label }}
                </div>
                <p class="mt-1 font-semibold text-highlighted">{{ feature.value }}</p>
            </div>
        </div>

        <div class="mt-5 flex gap-2">
            <UButton block icon="i-lucide-pencil" color="neutral" variant="outline" label="Edit"
                @click="emit('edit', plan)" />
            <UButton block icon="i-lucide-copy" color="primary" variant="soft" label="Duplicate" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Plan } from '~/types'

const props = defineProps<{
    plan: Plan
}>()

const emit = defineEmits<{
    edit: [plan: Plan]
}>()

const statusColor = computed<'success' | 'warning' | 'error' | 'neutral'>(() => {
    if (props.plan.status === 'active') return 'success'
    if (props.plan.status === 'draft') return 'warning'
    if (props.plan.status === 'disabled') return 'error'
    return 'neutral'
})

const features = computed(() => [
    { label: 'Disk Space', value: props.plan.disk, icon: 'i-lucide-hard-drive' },
    { label: 'Bandwidth', value: props.plan.bandwidth, icon: 'i-lucide-activity' },
    { label: 'Domains', value: props.plan.domains, icon: 'i-lucide-globe' },
    { label: 'Databases', value: props.plan.databases, icon: 'i-lucide-database' },
    { label: 'Emails', value: props.plan.emails, icon: 'i-lucide-mail' },
    { label: 'Free SSL', value: props.plan.ssl ? 'Included' : 'No', icon: 'i-lucide-lock-keyhole' }
])

const items: DropdownMenuItem[][] = [
    [
        { label: 'View Details', icon: 'i-lucide-eye' },
        {
            label: 'Edit Plan',
            icon: 'i-lucide-pencil',
            onSelect: () => emit('edit', props.plan)
        },
        { label: 'Duplicate', icon: 'i-lucide-copy' }
    ],
    [
        { label: 'Disable', icon: 'i-lucide-ban', color: 'warning' },
        { label: 'Delete', icon: 'i-lucide-trash', color: 'error' }
    ]
]
</script>