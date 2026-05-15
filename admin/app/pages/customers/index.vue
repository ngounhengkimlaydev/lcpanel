<template>
  <UDashboardPanel id="customers">
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Customers
              </h3>
              <div class="flex space-x-2">
                <UButton icon="i-lucide-dices" label="View Customer Dashboard" @click="dashboard = true" />
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="getData" />
                <!-- <UButton icon="i-lucide-user-plus" label="Add Customer" @click="openCreateModal"/> -->
              </div>
            </div>
          </template>
          <CustomerToolbar v-model:search="search" v-model:status="status" />
          <CustomerTable :customers="filteredCustomers" @edit="openEditModal" />
        </UCard>
        <CustomerFormModal v-model:open="isModalOpen" :type="modalType" :customer="selectedCustomer"
          @submit="handleSubmit" />
      </div>
      <USlideover v-model:open="dashboard" title="Customer">
        <template #body>
          <CustomerStats />
        </template>
      </USlideover>
    </template>

  </UDashboardPanel>
</template>

<script setup lang="ts">
import CustomerStats from '~/components/customers/CustomerStats.vue'
import CustomerTable from '~/components/customers/CustomerTable.vue'
import CustomerToolbar from '~/components/customers/CustomerToolbar.vue'
import CustomerFormModal from '~/components/customers/CustomerFormModal.vue'
import type { Customer } from '~/types'

definePageMeta({
  middleware: "alc",
  moduleKey: moduleKey.CUSTOMER,
})

const search = ref('')
const status = ref('all')
const dashboard = ref<boolean>(false)
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedCustomer = ref<Customer | null>(null)
const loading = ref<boolean>(false)
const fetch = useApiFetch()

const customers = ref<Customer[]>([])

const filteredCustomers = computed(() => {
  return customers.value.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.value.toLowerCase()) ||
      item.email.toLowerCase().includes(search.value.toLowerCase())

    const matchStatus = status.value === 'all' || item.status === status.value

    return matchSearch && matchStatus
  })
})

function openCreateModal() {
  modalType.value = 'create'
  selectedCustomer.value = null
  isModalOpen.value = true
}

function openEditModal(customer: Customer) {
  modalType.value = 'edit'
  selectedCustomer.value = customer
  isModalOpen.value = true
}

function handleSubmit(payload: Customer) {
  if (modalType.value === 'create') {
    customers.value.unshift({
      ...payload,
      id: Date.now(),
      created_at: new Date().toISOString().slice(0, 10)
    })
  } else {
    const index = customers.value.findIndex((item) => item.id === payload.id)

    if (index !== -1) {
      customers.value[index] = payload
    }
  }

  isModalOpen.value = false
}

const getData = async () => {
  try {
    const data = await fetch.paginate('/customer')
    customers.value = data.data
  } finally {

  }
}

onMounted(getData)
</script>
