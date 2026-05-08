<template>
    <UDashboardPanel id="processes">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Processes
                            </h3>

                            <div class="flex gap-2">
                                <UButton icon="i-lucide-chart-no-axes-column" label="View Process Dashboard"
                                    @click="dashboard = true" />

                                <UButton icon="i-lucide-plus" label="Add Process" @click="openCreateModal" />
                            </div>
                        </div>
                    </template>
                    <ProcessToolbar v-model:search="search" v-model:status="status" />
                    <ProcessTable :processes="filteredProcesses" @edit="openEditModal" @delete="deleteProcess" />
                </UCard>

                <ProcessFormModal v-model:open="isModalOpen" :type="modalType" :process="selectedProcess"
                    @submit="handleSubmit" />
            </div>

            <USlideover v-model:open="dashboard" title="Process Dashboard">
                <template #body>
                    <ProcessStats :processes="processes" />
                </template>
            </USlideover>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import ProcessStats from '~/components/processes/ProcessStats.vue'
import ProcessTable from '~/components/processes/ProcessTable.vue'
import ProcessToolbar from '~/components/processes/ProcessToolbar.vue'
import ProcessFormModal from '~/components/processes/ProcessFormModal.vue'
import type { ServerProcess } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.PROCESS,
})

const search = ref('')
const status = ref('all')
const dashboard = ref(false)

const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const selectedProcess = ref<ServerProcess | null>(null)

const processes = ref<ServerProcess[]>([
    {
        id: 1,
        pid: 1248,
        name: 'nginx',
        user: 'root',
        cpu: 1.2,
        memory: 45.6,
        status: 'running',
        uptime: '3d 12h',
        command: 'nginx: master process',
        created_at: '2026-05-07'
    },
    {
        id: 2,
        pid: 2310,
        name: 'node',
        user: 'lay',
        cpu: 8.4,
        memory: 320.5,
        status: 'running',
        uptime: '12h 21m',
        command: 'node dist/main.js',
        created_at: '2026-05-07'
    },
    {
        id: 3,
        pid: 1902,
        name: 'mysql',
        user: 'mysql',
        cpu: 3.1,
        memory: 512.2,
        status: 'sleeping',
        uptime: '5d 2h',
        command: 'mysqld',
        created_at: '2026-05-07'
    }
])

const filteredProcesses = computed(() => {
    return processes.value.filter((item: any) => {
        const matchSearch =
            item.name.toLowerCase().includes(search.value.toLowerCase()) ||
            item.user.toLowerCase().includes(search.value.toLowerCase()) ||
            item.command.toLowerCase().includes(search.value.toLowerCase()) ||
            String(item.pid).includes(search.value)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

function openCreateModal() {
    modalType.value = 'create'
    selectedProcess.value = null
    isModalOpen.value = true
}

function openEditModal(process: ServerProcess) {
    modalType.value = 'edit'
    selectedProcess.value = process
    isModalOpen.value = true
}

function handleSubmit(payload: ServerProcess) {
    if (modalType.value === 'create') {
        processes.value.unshift({
            ...payload,
            id: Date.now(),
            created_at: new Date().toISOString().slice(0, 10)
        })
    } else {
        const index = processes.value.findIndex((item: any) => item.id === payload.id)

        if (index !== -1) {
            processes.value[index] = payload
        }
    }

    isModalOpen.value = false
}

function deleteProcess(process: ServerProcess) {
    processes.value = processes.value.filter((item: any) => item.id !== process.id)
}
</script>
