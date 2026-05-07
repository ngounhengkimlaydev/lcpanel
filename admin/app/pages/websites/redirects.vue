<template>
    <UDashboardPanel id="redirects">
        <template #default>
            <div class="space-y-6">
                <UCard>

                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Redirects</h3>
                            <UButton icon="i-lucide-plus" label="Add Redirect" @click="openCreateModal" />
                        </div>
                    </template>

                    <RedirectToolbar :search="search" :status="status" @update:search="search = $event"
                        @update:status="status = $event" />

                    <RedirectTable :redirects="filteredRedirects" @edit="openEditModal" @delete="deleteRedirect" />
                </UCard>
            </div>
            <RedirectFormModal v-model:open="isModalOpen" :type="modalType" :redirect="selectedRedirect"
                @submit="handleSubmit" />
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import RedirectToolbar from '~/components/websites/redirects/RedirectToolbar.vue'
import RedirectTable from '~/components/websites/redirects/RedirectTable.vue'
import RedirectFormModal from '~/components/websites/redirects/RedirectFormModal.vue'
import type { RedirectItem } from '~/types/website'

definePageMeta({ middleware: ['super-admin'] })

const search = ref('')
const status = ref('all')
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedRedirect = ref<RedirectItem | null>(null)

const redirects = ref<RedirectItem[]>([
    {
        id: 1,
        source: 'http://ltech.digital',
        target: 'https://ltech.digital',
        type: '301',
        https: true,
        status: 'active',
        created_at: '2026-05-07'
    }
])

const filteredRedirects = computed(() => {
    return redirects.value.filter((item: any) => {
        const matchSearch =
            item.source.toLowerCase().includes(search.value.toLowerCase()) ||
            item.target.toLowerCase().includes(search.value.toLowerCase())

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedRedirect.value = null
    isModalOpen.value = true
}

function openEditModal(redirect: RedirectItem) {
    modalType.value = 'edit'
    selectedRedirect.value = redirect
    isModalOpen.value = true
}

function handleSubmit(payload: RedirectItem) {
    if (modalType.value === 'create') {
        redirects.value.unshift({ ...payload, id: Date.now(), created_at: new Date().toISOString().slice(0, 10) })
    } else {
        const index = redirects.value.findIndex((item: any) => item.id === payload.id)
        if (index !== -1) redirects.value[index] = payload
    }

    isModalOpen.value = false
}

function deleteRedirect(redirect: RedirectItem) {
    redirects.value = redirects.value.filter((item: any) => item.id !== redirect.id)
}
</script>