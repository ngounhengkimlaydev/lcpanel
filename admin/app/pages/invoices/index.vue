<template>
    <UDashboardPanel id="invoices">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Invoice
                            </h3>
                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-dices" label="View Invoice Dashboard"
                                    @click="dashboard = true" />
                                <UButton icon="i-lucide-receipt-text" label="Create Invoice" @click="isCreateOpen = true" />
                            </div>
                        </div>
                    </template>
                    <InvoiceToolbar v-model:search="search" v-model:status="status" />
                    <InvoiceTable :data="filteredInvoices" @view="viewInvoice" @paid="markAsPaid" @send="sendInvoice"
                        @download="downloadInvoice" @delete="deleteInvoice" />

                    <InvoiceCreateModal v-model:open="isCreateOpen" @submit="createInvoice" />
                    <InvoiceViewModal v-model:open="isViewOpen" :invoice="selectedInvoice" />
                    <USlideover v-model:open="dashboard" title="Invoice">
                        <template #body>
                            <InvoiceStats />
                        </template>
                    </USlideover>
                </UCard>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import InvoiceCreateModal from '~/components/invoices/InvoiceCreateModal.vue'
import InvoiceStats from '~/components/invoices/InvoiceStats.vue'
import InvoiceTable from '~/components/invoices/InvoiceTable.vue'
import InvoiceToolbar from '~/components/invoices/InvoiceToolbar.vue'
import InvoiceViewModal from '~/components/invoices/InvoiceViewModal.vue'
import type { Invoice } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.INVOICE,
})

const isCreateOpen = ref(false)
const isViewOpen = ref(false)
const selectedInvoice = ref<Invoice | null>(null)
const search = ref('')
const status = ref('all')
const dashboard = ref<boolean>(false)
const invoices = ref([
    { id: 'INV-001', customer: 'LTech Digital', amount: '$15.00', status: 'paid', due_date: '2026-06-01' },
    { id: 'INV-002', customer: 'Nexora Client', amount: '$5.00', status: 'unpaid', due_date: '2026-05-15' },
    { id: 'INV-003', customer: 'Khmer Cloud', amount: '$49.00', status: 'overdue', due_date: '2026-05-01' }
])

const filteredInvoices = computed(() =>
    invoices.value.filter((item) => {
        const matchSearch =
            item.id.toLowerCase().includes(search.value.toLowerCase()) ||
            item.customer.toLowerCase().includes(search.value.toLowerCase())

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
)


function viewInvoice(invoice: Invoice) {
    console.log('view', invoice)
}

function markAsPaid(invoice: Invoice) {
    const current = invoices.value.find((item) => item.id === invoice.id)

    if (!current) return

    current.status = 'paid'
}

function sendInvoice(invoice: Invoice) {
    console.log('send invoice', invoice)
}

function downloadInvoice(invoice: Invoice) {
    console.log('download invoice', invoice)
}

function deleteInvoice(invoice: Invoice) {
    invoices.value = invoices.value.filter((item) => item.id !== invoice.id)
}
function openView(invoice: Invoice) {
    selectedInvoice.value = invoice
    isViewOpen.value = true
}

function createInvoice(payload: Invoice) {
    invoices.value.unshift(payload)
    isCreateOpen.value = false
}
</script>
