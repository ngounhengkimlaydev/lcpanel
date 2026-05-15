<template>
    <UDashboardPanel id="subscriptions">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Subscription
                            </h3>
                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-dices" label="View Subscription Dashboard"
                                    @click="dashboard = true" />
                                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline"
                                    @click="getData" />
                            </div>
                        </div>
                    </template>
                    <div class="space-y-6">
                        <SubscriptionToolbar v-model:search="search" v-model:status="status" />
                        <SubscriptionTable
                            :subscriptions="subscriptions"
                            :total="total"
                            :page="page"
                            :page-size="pageSize"
                            @view="openViewModal"
                            @update:page="page = $event"
                        />
                        <SubscriptionViewModal v-model:open="isViewOpen" :subscription="selectedSubscription" />
                    </div>
                </UCard>
            </div>
            <USlideover v-model:open="dashboard" title="Subscription">
                <template #body>
                    <SubscriptionStats />
                </template>
            </USlideover>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Subscription, SubscriptionStatusKey } from '~/types'

import SubscriptionStats from '~/components/subscriptions/SubscriptionStats.vue'
import SubscriptionTable from '~/components/subscriptions/SubscriptionTable.vue'
import SubscriptionToolbar from '~/components/subscriptions/SubscriptionToolbar.vue'
import SubscriptionViewModal from '~/components/subscriptions/SubscriptionViewModal.vue'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.SUBSCRIPTION,
})

const search = ref('')
const status = ref<'all' | SubscriptionStatusKey>('all')
const dashboard = ref<boolean>(false)
const isViewOpen = ref(false)
const selectedSubscription = ref<Subscription | null>(null)
const fetch = useApiFetch()
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const subscriptions = ref<Subscription[]>([])

async function openViewModal(subscription: Subscription) {
    isViewOpen.value = true

    const res = await fetch.get(`/subscriptions/${subscription.id}`)
    selectedSubscription.value = res?.data ?? res
}

const getData = async () => {
    const res = await fetch.paginate('/subscriptions', {
        page: page.value,
        table_size: pageSize.value,
        filter: {
            search: search.value.trim(),
            status: status.value === 'all' ? undefined : status.value,
        },
        sort_by: 'created_at',
        sort_type: 'desc'
    })

    subscriptions.value = res?.data ?? []
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
