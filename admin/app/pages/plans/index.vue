<template>
  <UDashboardPanel id="plans">
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Hosting Plans
              </h3>
              <div class="flex space-x-2">
                <UButton icon="i-lucide-dices" label="View Plan Dashboard" @click="dashboard = true" />
                <UButton icon="i-lucide-package-plus" label="Create Plan" @click="openCreateModal" />
              </div>
            </div>
          </template>
          <PlanToolbar v-model:search="search" v-model:status="status" />
          <PlanGrid :plans="filteredPlans" @edit="openEditModal" />
        </UCard>
        <PlanFormModal v-model:open="isModalOpen" :type="modalType" :plan="selectedPlan" @submit="handleSubmit" />
      </div>
      <USlideover v-model:open="dashboard" title="Plan">
        <template #body>
          <PlanStats />
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PlanGrid from '~/components/plans/PlanGrid.vue'
import PlanStats from '~/components/plans/PlanStats.vue'
import PlanToolbar from '~/components/plans/PlanToolbar.vue'
import PlanFormModal from '~/components/plans/PlanFormModal.vue'
import type { Plan } from '~/types'


const search = ref('')
const status = ref('all')
const dashboard = ref<boolean>(false)
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedPlan = ref<Plan | null>(null)

const plans = ref<Plan[]>([
  {
    id: 1,
    name: 'Basic',
    price: 5,
    status: 'active',
    customers: 24,
    disk: '3 GB',
    bandwidth: '50 GB',
    domains: 1,
    databases: 1,
    emails: 3,
    ssl: true
  },
  {
    id: 2,
    name: 'Business',
    price: 15,
    status: 'active',
    customers: 12,
    disk: '10 GB',
    bandwidth: '200 GB',
    domains: 5,
    databases: 5,
    emails: 20,
    ssl: true
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 49,
    status: 'draft',
    customers: 3,
    disk: '50 GB',
    bandwidth: '1 TB',
    domains: 20,
    databases: 20,
    emails: 100,
    ssl: true
  }
])

const filteredPlans = computed(() => {
  return plans.value.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = status.value === 'all' || item.status === status.value

    return matchSearch && matchStatus
  })
})

function openCreateModal() {
  modalType.value = 'create'
  selectedPlan.value = null
  isModalOpen.value = true
}

function openEditModal(plan: Plan) {
  modalType.value = 'edit'
  selectedPlan.value = plan
  isModalOpen.value = true
}

function handleSubmit(payload: Plan) {
  if (modalType.value === 'create') {
    plans.value.unshift({
      ...payload,
      id: Date.now(),
      customers: 0
    })
  } else {
    const index = plans.value.findIndex((item) => item.id === payload.id)

    if (index !== -1) {
      plans.value[index] = payload
    }
  }

  isModalOpen.value = false
}
</script>