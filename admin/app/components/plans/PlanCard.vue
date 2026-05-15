<template>
  <div class="rounded-2xl border border-default bg-elevated/40 p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-bold text-highlighted">{{ plan.name }}</h3>
          <UBadge :color="statusColor" variant="soft">
            {{ statusLabel }}
          </UBadge>
        </div>

        <p class="mt-1 text-sm text-muted">
          {{ typeLabel }}
        </p>

        <!-- <p class="mt-2 line-clamp-2 text-sm text-muted">
          {{ plan.description }}
        </p> -->
      </div>

      <UDropdownMenu :items="items">
        <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
      </UDropdownMenu>
    </div>

    <div class="mt-5">
      <span class="text-4xl font-black text-highlighted">{{ formattedPrice }}</span>
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
      <UButton
        block
        icon="i-lucide-pencil"
        color="neutral"
        variant="outline"
        label="Edit"
        @click="emit('edit', plan)"
      />
      <UButton
        block
        icon="i-lucide-trash"
        color="error"
        variant="soft"
        label="Delete"
        @click="emit('delete', plan)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Plan } from '~/types'
import {
  formatPlanCurrency,
  formatPlanStorage,
  getPlanStatusColor,
  getPlanStatusLabel,
  getPlanTypeLabel
} from '~/utils/plan'

const props = defineProps<{
  plan: Plan
}>()

const emit = defineEmits<{
  edit: [plan: Plan]
  delete: [plan: Plan]
  'toggle-status': [plan: Plan]
}>()

const statusColor = computed<'success' | 'warning' | 'error' | 'neutral'>(() => {
  return getPlanStatusColor(props.plan.status)
})

const statusLabel = computed(() => getPlanStatusLabel(props.plan.status))
const typeLabel = computed(() => getPlanTypeLabel(props.plan.type))
const formattedPrice = computed(() => formatPlanCurrency(props.plan.price))

const features = computed(() => [
  { label: 'Disk Space', value: formatPlanStorage(props.plan.disk_space), icon: 'i-lucide-hard-drive' },
  { label: 'Bandwidth', value: `${props.plan.bandwidth} GB`, icon: 'i-lucide-activity' },
  { label: 'Domains', value: props.plan.domain, icon: 'i-lucide-globe' },
  { label: 'Databases', value: props.plan.database, icon: 'i-lucide-database' },
  { label: 'Emails', value: props.plan.email ?? 0, icon: 'i-lucide-mail' },
  { label: 'Free SSL', value: props.plan.ssl ? 'Included' : 'No', icon: 'i-lucide-lock-keyhole' }
])

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Edit Plan',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', props.plan)
    }
  ],
  [
    {
      label: props.plan.status === 1 ? 'Disable Plan' : 'Activate Plan',
      icon: props.plan.status === 1 ? 'i-lucide-ban' : 'i-lucide-badge-check',
      color: props.plan.status === 1 ? 'warning' : 'success',
      onSelect: () => emit('toggle-status', props.plan)
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => emit('delete', props.plan)
    }
  ]
])
</script>
