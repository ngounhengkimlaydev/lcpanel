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
          <CustomerTable :customers="customers" @edit="openEditModal" :total="total" :page="page"
            :page-size="pageSize" @update:page="page = $event" />
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
import type { Customer, CustomerStatus } from '~/types'

definePageMeta({
  middleware: "alc",
  moduleKey: moduleKey.CUSTOMER,
})

type CustomerStatusFilter = 'all' | `${CustomerStatus}`
type CustomerFormValue = {
  id: number
  name: string
  email: string
  plan: string
  websites: number
  storage: string
  status: string
  created_at: string
}

const status = ref<CustomerStatusFilter>('all')
const dashboard = ref<boolean>(false)
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedCustomer = ref<CustomerFormValue | null>(null)
const fetch = useApiFetch()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const customers = ref<Customer[]>([])

function openCreateModal() {
  modalType.value = 'create'
  selectedCustomer.value = null
  isModalOpen.value = true
}

function openEditModal(customer: Customer) {
  modalType.value = 'edit'
  selectedCustomer.value = {
    ...customer,
    email: customer.email ?? '',
    storage: String(customer.storage),
    status: String(customer.status),
  }
  isModalOpen.value = true
}

function toCustomerRow(payload: CustomerFormValue): Customer {
  return {
    ...payload,
    email: payload.email || null,
    storage: Number(payload.storage) || 0,
    status: Number(payload.status) as CustomerStatus,
  }
}

function handleSubmit(payload: CustomerFormValue) {
  const customer = toCustomerRow(payload)

  if (modalType.value === 'create') {
    customers.value.unshift({
      ...customer,
      id: Date.now(),
      created_at: new Date().toISOString().slice(0, 10)
    })
  } else {
    const index = customers.value.findIndex((item) => item.id === customer.id)

    if (index !== -1) {
      customers.value[index] = customer
    }
  }

  isModalOpen.value = false
}

const getData = async () => {
  const res = await fetch.paginate('/customer', {
    page: page.value,
    table_size: pageSize.value,
    filter: {
      search: search.value.trim(),
      status: status.value === 'all' ? undefined : Number(status.value),
    },
    sort_by: 'created_at',
    sort_type: 'desc'
  })

  customers.value = res?.data ?? []
  total.value = res?.pagination?.total ?? res?.total ?? 0
}

function resetToFirstPageAndReload() {
  if (page.value === 1) {
    getData()
    return
  }

  page.value = 1
}

const debouncedSearch = useDebounceFn(() => {
  resetToFirstPageAndReload()
}, 400)

watch(page, () => {
  getData()
})

watch(status, () => {
  resetToFirstPageAndReload()
})

watch(search, () => {
  debouncedSearch()
})

onMounted(getData)
</script>
