<template>
    <UDashboardPanel id="subscriptions">
        <template #header>
            <UDashboardNavbar title="Subscriptions">
                <template #right>
                    <UButton icon="i-lucide-plus" label="Create Subscription" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="space-y-6">
                <SubscriptionStats />

                <UCard>
                    <SubscriptionToolbar v-model:search="search" v-model:status="status" />

                    <SubscriptionTable :subscriptions="filteredSubscriptions" @view="openViewModal"
                        @renew="renewSubscription" @change-plan="openChangePlanModal" @cancel="cancelSubscription" />
                </UCard>

                <SubscriptionFormModal v-model:open="isFormOpen" @submit="createSubscription" />

                <SubscriptionViewModal v-model:open="isViewOpen" :subscription="selectedSubscription" />

                <SubscriptionChangePlanModal v-model:open="isChangePlanOpen" :subscription="selectedSubscription"
                    @submit="changePlan" />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Subscription } from '~/types'

import SubscriptionStats from '~/components/subscriptions/SubscriptionStats.vue'
import SubscriptionTable from '~/components/subscriptions/SubscriptionTable.vue'
import SubscriptionToolbar from '~/components/subscriptions/SubscriptionToolbar.vue'
import SubscriptionFormModal from '~/components/subscriptions/SubscriptionFormModal.vue'
import SubscriptionViewModal from '~/components/subscriptions/SubscriptionViewModal.vue'
import SubscriptionChangePlanModal from '~/components/subscriptions/SubscriptionChangePlanModal.vue'

const search = ref('')
const status = ref('all')

const isFormOpen = ref(false)
const isViewOpen = ref(false)
const isChangePlanOpen = ref(false)
const selectedSubscription = ref<Subscription | null>(null)

const subscriptions = ref<Subscription[]>([
    {
        id: 1,
        customer: 'LTech Digital',
        email: 'admin@ltech.digital',
        plan: 'Business',
        price: '$15/month',
        status: 'active',
        started_at: '2026-05-01',
        expired_at: '2026-06-01',
        websites: 3
    },
    {
        id: 2,
        customer: 'Nexora Client',
        email: 'client@nexora.com',
        plan: 'Basic',
        price: '$5/month',
        status: 'past_due',
        started_at: '2026-04-15',
        expired_at: '2026-05-15',
        websites: 1
    }
])

const filteredSubscriptions = computed(() => {
    return subscriptions.value.filter((item) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            item.customer.toLowerCase().includes(keyword) ||
            item.email.toLowerCase().includes(keyword) ||
            item.plan.toLowerCase().includes(keyword)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    isFormOpen.value = true
}

function openViewModal(subscription: Subscription) {
    selectedSubscription.value = subscription
    isViewOpen.value = true
}

function openChangePlanModal(subscription: Subscription) {
    selectedSubscription.value = subscription
    isChangePlanOpen.value = true
}

function createSubscription(payload: Subscription) {
    subscriptions.value.unshift({
        ...payload,
        id: Date.now(),
        started_at: new Date().toISOString().slice(0, 10),
        expired_at: getNextMonthDate(),
        status: 'active'
    })

    isFormOpen.value = false
}

function renewSubscription(subscription: Subscription) {
    const current = subscriptions.value.find((item) => item.id === subscription.id)

    if (!current) return

    current.status = 'active'
    current.expired_at = addOneMonth(current.expired_at)
}

function changePlan(payload: { id: number; plan: string; price: string }) {
    const current = subscriptions.value.find((item) => item.id === payload.id)

    if (!current) return

    current.plan = payload.plan
    current.price = payload.price

    isChangePlanOpen.value = false
}

function cancelSubscription(subscription: Subscription) {
    const current = subscriptions.value.find((item) => item.id === subscription.id)

    if (!current) return

    current.status = 'cancelled'
}

function getNextMonthDate() {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().slice(0, 10)
}

function addOneMonth(dateString: string) {
    const date = new Date(dateString)
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().slice(0, 10)
}
</script>