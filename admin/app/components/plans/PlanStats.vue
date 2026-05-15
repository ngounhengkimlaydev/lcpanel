<template>
  <div class="grid grid-cols-1 gap-4 ">
    <UCard v-for="item in stats" :key="item.label" class="relative overflow-hidden">
      <div class="absolute -right-8 -top-8 size-28 rounded-full bg-primary/10" />

      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted">{{ item.label }}</p>
          <h3 class="mt-2 text-3xl font-bold text-highlighted">{{ item.value }}</h3>
          <p class="mt-2 text-sm" :class="item.color">{{ item.caption }}</p>
        </div>

        <div class="rounded-2xl bg-primary/10 p-3 text-primary">
          <UIcon :name="item.icon" class="size-7" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '~/types'
import { formatPlanCurrency } from '~/utils/plan'

const props = defineProps<{
  plans: Plan[]
}>()

const stats = computed(() => {
  const activePlans = props.plans.filter((plan) => plan.status === 1)
  const disabledPlans = props.plans.filter((plan) => plan.status === 2)
  const plansWithSsl = props.plans.filter((plan) => plan.ssl).length
  const monthlyRevenue = activePlans.reduce((sum, plan) => sum + Number(plan.price), 0)
  const averagePlanPrice =
    props.plans.length === 0
      ? 0
      : props.plans.reduce((sum, plan) => sum + Number(plan.price), 0) / props.plans.length

  return [
    {
      label: 'Total Plans',
      value: props.plans.length,
      caption: `${activePlans.length} active plans`,
      icon: 'i-lucide-package',
      color: 'text-success'
    },
    {
      label: 'Plans With SSL',
      value: plansWithSsl,
      caption: `${disabledPlans.length} disabled plans`,
      icon: 'i-lucide-shield-check',
      color: 'text-info'
    },
    // {
    //   label: 'Monthly Revenue',
    //   value: formatPlanCurrency(monthlyRevenue),
    //   caption: 'Potential recurring revenue',
    //   icon: 'i-lucide-credit-card',
    //   color: 'text-success'
    // },
    // {
    //   label: 'Avg. Plan Price',
    //   value: formatPlanCurrency(averagePlanPrice),
    //   caption: 'Across all plans',
    //   icon: 'i-lucide-chart-no-axes-column',
    //   color: 'text-warning'
    // }
  ]
})
</script>
