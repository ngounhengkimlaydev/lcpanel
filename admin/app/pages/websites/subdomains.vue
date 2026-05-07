<template>
    <UDashboardPanel id="subdomains">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Subdomains</h3>
                            <UButton icon="i-lucide-plus" label="Add Subdomain" @click="openCreateModal" />
                        </div>
                    </template>

                    <SubdomainToolbar :search="search" :status="status" @update:search="search = $event"
                        @update:status="status = $event" />

                    <SubdomainTable :subdomains="filteredSubdomains" @edit="openEditModal" @delete="deleteSubdomain" />
                </UCard>
            </div>
            <SubdomainFormModal v-model:open="isModalOpen" :type="modalType" :subdomain="selectedSubdomain"
                @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import SubdomainToolbar from '~/components/websites/subdomains/SubdomainToolbar.vue'
import SubdomainTable from '~/components/websites/subdomains/SubdomainTable.vue'
import SubdomainFormModal from '~/components/websites/subdomains/SubdomainFormModal.vue'
import type { SubdomainItem } from '~/types/website'

definePageMeta({ middleware: ['super-admin'] })

const search = ref('')
const status = ref('all')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedSubdomain = ref<SubdomainItem | null>(null)

const subdomains = ref<SubdomainItem[]>([
    {
        id: 1,
        subdomain: 'api',
        domain: 'ltech.digital',
        document_root: '/var/www/ltech.digital/api',
        status: 'active',
        created_at: '2026-05-07'
    }
])

const filteredSubdomains = computed(() => {
    return subdomains.value.filter((item: any) => {
        const matchSearch =
            item.subdomain.toLowerCase().includes(search.value.toLowerCase()) ||
            item.domain.toLowerCase().includes(search.value.toLowerCase()) ||
            item.document_root.toLowerCase().includes(search.value.toLowerCase())

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedSubdomain.value = null
    isModalOpen.value = true
}

function openEditModal(subdomain: SubdomainItem) {
    modalType.value = 'edit'
    selectedSubdomain.value = subdomain
    isModalOpen.value = true
}

function handleSubmit(payload: SubdomainItem) {
    if (modalType.value === 'create') {
        subdomains.value.unshift({ ...payload, id: Date.now(), created_at: new Date().toISOString().slice(0, 10) })
    } else {
        const index = subdomains.value.findIndex((item: any) => item.id === payload.id)
        if (index !== -1) subdomains.value[index] = payload
    }

    isModalOpen.value = false
}

function deleteSubdomain(subdomain: SubdomainItem) {
    subdomains.value = subdomains.value.filter((item: any) => item.id !== subdomain.id)
}
</script>