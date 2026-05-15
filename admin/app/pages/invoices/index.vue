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
                                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" @click="getData" />
                            </div>
                        </div>
                    </template>
                    <InvoiceToolbar v-model:search="search" v-model:status="status" />
                    <InvoiceTable
                        :data="invoices"
                        :total="total"
                        :page="page"
                        :page-size="pageSize"
                        @view="viewInvoice"
                        @download="downloadInvoice"
                        @update:page="page = $event"
                    />

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
import InvoiceStats from '~/components/invoices/InvoiceStats.vue'
import InvoiceTable from '~/components/invoices/InvoiceTable.vue'
import InvoiceToolbar from '~/components/invoices/InvoiceToolbar.vue'
import InvoiceViewModal from '~/components/invoices/InvoiceViewModal.vue'
import type { Invoice, InvoiceStatusKey } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.INVOICE,
})

const isViewOpen = ref(false)
const selectedInvoice = ref<Invoice | null>(null)
const search = ref('')
const status = ref<'all' | Exclude<InvoiceStatusKey, 'unknown'>>('all')
const dashboard = ref<boolean>(false)
const fetch = useApiFetch()
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const invoices = ref<Invoice[]>([])

async function viewInvoice(invoice: Invoice) {
    isViewOpen.value = true

    const res = await fetch.get(`/invoices/${invoice.id}`)
    selectedInvoice.value = res?.data ?? res
}

function downloadBase64File(fileName: string, mimeType: string, contentBase64: string) {
    const link = document.createElement('a')
    link.href = `data:${mimeType};base64,${contentBase64}`
    link.download = fileName
    link.click()
}

async function downloadInvoice(invoice: Invoice) {
    const res = await fetch.get(`/invoices/${invoice.id}/download`)
    const payload = res?.data ?? res

    downloadBase64File(
        payload.file_name,
        payload.mime_type,
        payload.content_base64
    )
}

const getData = async () => {
    const res = await fetch.paginate('/invoices', {
        page: page.value,
        table_size: pageSize.value,
        filter: {
            search: search.value.trim(),
            status: status.value === 'all' ? undefined : status.value,
        },
        sort_by: 'created_at',
        sort_type: 'desc'
    })

    invoices.value = res?.data ?? []
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
