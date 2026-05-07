<template>
    <UDashboardPanel id="domains">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Domains</h3>
                            <UButton icon="i-lucide-plus" label="Add Domain" @click="openCreateModal" />
                        </div>
                    </template>

                    <DomainToolbar :search="search" :status="status" @update:search="search = $event"
                        @update:status="status = $event" />
                    <DomainTable :domains="filteredDomains" @edit="openEditModal" @delete="deleteDomain" />
                </UCard>
            </div>
            <DomainFormModal v-model:open="isModalOpen" :type="modalType" :domain="selectedDomain"
                @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import DomainToolbar from '~/components/websites/domains/DomainToolbar.vue'
import DomainTable from '~/components/websites/domains/DomainTable.vue'
import DomainFormModal from '~/components/websites/domains/DomainFormModal.vue'
import type { DomainItem } from '~/types/website'

definePageMeta({ middleware: ['super-admin'] })

const search = ref('')
const status = ref('all')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedDomain = ref<DomainItem | null>(null)

const domains = ref<DomainItem[]>([
    { id: 1, domain: 'ltech.digital', website: 'LTech Website', ssl: true, status: 'active', created_at: '2026-05-07' },
    { id: 2, domain: 'taskio.site', website: 'Taskio', ssl: true, status: 'active', created_at: '2026-05-07' }
])

const filteredDomains = computed(() => {
    return domains.value.filter((item: any) => {
        const matchSearch =
            item.domain.toLowerCase().includes(search.value.toLowerCase()) ||
            item.website.toLowerCase().includes(search.value.toLowerCase())

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedDomain.value = null
    isModalOpen.value = true
}

function openEditModal(domain: DomainItem) {
    modalType.value = 'edit'
    selectedDomain.value = domain
    isModalOpen.value = true
}

function handleSubmit(payload: DomainItem) {
    if (modalType.value === 'create') {
        domains.value.unshift({ ...payload, id: Date.now(), created_at: new Date().toISOString().slice(0, 10) })
    } else {
        const index = domains.value.findIndex((item: any) => item.id === payload.id)
        if (index !== -1) domains.value[index] = payload
    }

    isModalOpen.value = false
}

function deleteDomain(domain: DomainItem) {
    domains.value = domains.value.filter((item: any) => item.id !== domain.id)
}
</script>