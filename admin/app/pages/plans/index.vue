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
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="getData" />
                <UButton icon="i-lucide-dices" label="View Plan Dashboard" @click="dashboard = true" />
                <UButton icon="i-lucide-package-plus" label="Create Plan" @click="openCreateModal" />
              </div>
            </div>
          </template>
          <PlanToolbar v-model:search="search" v-model:status="status" />
          <PlanGrid
            :plans="filteredPlans"
            @edit="openEditModal"
            @delete="deletePlan"
            @toggle-status="togglePlanStatus"
          />
        </UCard>
        <PlanFormModal v-model:open="isModalOpen" :type="modalType" :plan="selectedPlan" @submit="handleSubmit" />
      </div>
      <USlideover v-model:open="dashboard" title="Plan Dashboard">
        <template #body>
          <PlanStats :plans="plans" />
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import ConfirmModal from '~/components/ConfirmModal.vue'
import PlanGrid from '~/components/plans/PlanGrid.vue'
import PlanStats from '~/components/plans/PlanStats.vue'
import PlanToolbar from '~/components/plans/PlanToolbar.vue'
import PlanFormModal from '~/components/plans/PlanFormModal.vue'
import type { Plan, PlanStatus } from '~/types'
import { createDefaultPlan, getPlanTypeLabel } from '~/utils/plan'

definePageMeta({
  middleware: "alc",
  moduleKey: moduleKey.PLAN,
})

const search = ref('')
const status = ref<'all' | PlanStatus>('all')
const dashboard = ref<boolean>(false)
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedPlan = ref<Plan | null>(null)
const fetch = useApiFetch()
const toast = useToast()
const overlay = useOverlay()

const plans = ref<Plan[]>([])

const filteredPlans = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return plans.value.filter((item) => {
    const matchSearch =
      keyword.length === 0 ||
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      getPlanTypeLabel(item.type).toLowerCase().includes(keyword)

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
  selectedPlan.value = { ...createDefaultPlan(), ...plan }
  isModalOpen.value = true
}

function toPlanPayload(plan: Plan) {
  return {
    name: plan.name.trim(),
    description: plan.description.trim(),
    price: Number(plan.price),
    cpu: plan.cpu ?? undefined,
    ram: plan.ram ?? undefined,
    disk_space: Number(plan.disk_space),
    domain: Number(plan.domain),
    email: plan.email ?? undefined,
    ssl: Boolean(plan.ssl),
    database: Number(plan.database),
    website: Number(plan.website),
    ftp_account: plan.ftp_account ?? undefined,
    cronjob: plan.cronjob ?? undefined,
    backup: Boolean(plan.backup),
    cdn: Boolean(plan.cdn),
    staging: Boolean(plan.staging),
    ssh_access: Boolean(plan.ssh_access),
    docker_support: Boolean(plan.docker_support),
    bandwidth: Number(plan.bandwidth),
    type: Number(plan.type),
    status: Number(plan.status),
  }
}

async function handleSubmit(payload: Plan) {
  const body = toPlanPayload(payload)

  if (modalType.value === 'create') {
    await fetch.post('/plans', body)

    toast.add({
      title: 'Success',
      description: 'Plan created successfully',
      color: 'success'
    })
  } else {
    const planId = selectedPlan.value?.id ?? payload.id

    await fetch.put(`/plans/${planId}`, body)

    toast.add({
      title: 'Success',
      description: 'Plan updated successfully',
      color: 'success'
    })
  }

  isModalOpen.value = false
  selectedPlan.value = null
  await getData()
}

const getData = async () => {
  const res = await fetch.paginate('/plans', {
    page: 1,
    table_size: 100,
    sort_by: 'created_at',
    sort_type: 'desc'
  }, {}, false)

  plans.value = res?.data ?? []
}

async function deletePlan(plan: Plan) {
  const modal = overlay.create(ConfirmModal, {
    props: {
      title: 'Delete Plan',
      description: `Are you sure you want to delete "${plan.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      color: 'error'
    }
  })

  const instance = modal.open()
  const confirmed = await instance.result

  if (!confirmed) return

  await fetch.delete(`/plans/${plan.id}`)

  toast.add({
    title: 'Success',
    description: 'Plan deleted successfully',
    color: 'success'
  })

  await getData()
}

async function togglePlanStatus(plan: Plan) {
  const nextStatus: PlanStatus = plan.status === 1 ? 2 : 1

  await fetch.put(`/plans/${plan.id}/status`, { status: nextStatus })

  toast.add({
    title: 'Success',
    description: `Plan ${nextStatus === 1 ? 'activated' : 'disabled'} successfully`,
    color: 'success'
  })

  await getData()
}

onMounted(getData)
</script>
