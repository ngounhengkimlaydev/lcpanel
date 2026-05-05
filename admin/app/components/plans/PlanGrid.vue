<template>
  <div class="mt-5">
    <div v-if="plans.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      <PlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        @edit="emit('edit', $event)"
      />
    </div>

    <div v-else class="py-14 text-center">
      <UIcon name="i-lucide-package-x" class="mx-auto mb-3 size-10 text-muted" />
      <p class="font-medium text-highlighted">No plans found</p>
      <p class="text-sm text-muted">Try changing your filter or create a new plan.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '~/types'
import PlanCard from './PlanCard.vue'

defineProps<{
  plans: Plan[]
}>()

const emit = defineEmits<{
  edit: [plan: Plan]
}>()
</script>