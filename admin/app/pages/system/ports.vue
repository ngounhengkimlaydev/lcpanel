<template>
    <UDashboardPanel id="ports">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Ports
                            </h3>
                            <div class="flex gap-2">
                                <UButton icon="i-lucide-chart-no-axes-column" label="View Port Dashboard"
                                    @click="dashboard = true" />

                                <UButton icon="i-lucide-plus" label="Add Port" @click="openCreateModal" />
                            </div>
                        </div>
                    </template>
                    <PortToolbar v-model:search="search" v-model:status="status" v-model:protocol="protocol" />
                    <PortTable :ports="filteredPorts" @edit="openEditModal" @delete="deletePort" />
                </UCard>

                <PortFormModal v-model:open="isModalOpen" :type="modalType" :port="selectedPort"
                    @submit="handleSubmit" />
            </div>

            <USlideover v-model:open="dashboard" title="Port Dashboard">
                <template #body>
                    <PortStats :ports="ports" />
                </template>
            </USlideover>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import PortStats from '~/components/ports/PortStats.vue'
import PortTable from '~/components/ports/PortTable.vue'
import PortToolbar from '~/components/ports/PortToolbar.vue'
import PortFormModal from '~/components/ports/PortFormModal.vue'
import type { Port } from '~/types'


definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.PORT,
})

const search = ref('')
const status = ref('all')
const protocol = ref('all')
const dashboard = ref(false)

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedPort = ref<Port | null>(null)

const ports = ref<Port[]>([
    {
        id: 1,
        port: 22,
        protocol: 'TCP',
        service: 'SSH',
        description: 'Secure shell access',
        status: 'open',
        created_at: '2026-05-07'
    },
    {
        id: 2,
        port: 80,
        protocol: 'TCP',
        service: 'HTTP',
        description: 'Web server traffic',
        status: 'open',
        created_at: '2026-05-07'
    },
    {
        id: 3,
        port: 443,
        protocol: 'TCP',
        service: 'HTTPS',
        description: 'Secure web traffic',
        status: 'open',
        created_at: '2026-05-07'
    },
    {
        id: 4,
        port: 3306,
        protocol: 'TCP',
        service: 'MySQL',
        description: 'Database connection',
        status: 'closed',
        created_at: '2026-05-07'
    }
])

const filteredPorts = computed(() => {
    return ports.value.filter((item: any) => {
        const matchSearch =
            item.service.toLowerCase().includes(search.value.toLowerCase()) ||
            item.description.toLowerCase().includes(search.value.toLowerCase()) ||
            String(item.port).includes(search.value)

        const matchStatus = status.value === 'all' || item.status === status.value
        const matchProtocol = protocol.value === 'all' || item.protocol === protocol.value

        return matchSearch && matchStatus && matchProtocol
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedPort.value = null
    isModalOpen.value = true
}

function openEditModal(port: Port) {
    modalType.value = 'edit'
    selectedPort.value = port
    isModalOpen.value = true
}

function handleSubmit(payload: Port) {
    if (modalType.value === 'create') {
        ports.value.unshift({
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const index = ports.value.findIndex((item: any) => item.id === payload.id)

        if (index !== -1) {
            ports.value[index] = payload
        }
    }

    isModalOpen.value = false
}

function deletePort(port: Port) {
    ports.value = ports.value.filter((item: any) => item.id !== port.id)
}
</script>
