<template>
    <UDashboardPanel id="node-apps">
        <template #body>
            <div class="space-y-6">
                <NodeAppStats />

                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h2 class="text-lg font-bold text-highlighted">Node Apps</h2>
                                <p class="text-sm text-muted">
                                    Manage Node.js applications, startup files, ports and runtime.
                                </p>
                            </div>

                            <UButton icon="i-lucide-plus" label="Create Node App" @click="openCreateModal" />
                        </div>
                    </template>

                    <div class="space-y-4">
                        <NodeAppToolbar :search="search" :status="status" @update:search="search = $event"
                            @update:status="status = $event" />

                        <NodeAppTable :apps="filteredApps" @edit="openEditModal" @restart="restartApp" @stop="stopApp"
                            @logs="viewLogs" />
                    </div>
                </UCard>

                <NodeAppFormModal v-model:open="isModalOpen" :type="modalType" :app="selectedApp"
                    @submit="handleSubmit" />
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import NodeAppFormModal from '~/components/apps/NodeAppFormModal.vue'
import NodeAppTable from '~/components/apps/NodeAppTable.vue'
import NodeAppToolbar from '~/components/apps/NodeAppToolbar.vue'

type ModalType = 'create' | 'edit'

const search = ref('')
const status = ref('all')
const isModalOpen = ref(false)
const modalType = ref<ModalType>('create')
const selectedApp = ref<any>(null)

const apps = ref([
    {
        id: 1,
        name: 'lcpanel-api',
        domain: 'api.ltech.digital',
        path: '/var/www/lcpanel/core',
        startup: 'dist/main.js',
        runtime: 'Node 24',
        port: 41106,
        status: 'running'
    },
    {
        id: 2,
        name: 'client-dashboard',
        domain: 'dashboard.ltech.digital',
        path: '/var/www/client-dashboard',
        startup: '.output/server/index.mjs',
        runtime: 'Node 22',
        port: 3000,
        status: 'stopped'
    }
])

const filteredApps = computed(() => {
    return apps.value.filter((app) => {
        const keyword = search.value.toLowerCase()

        const matchSearch =
            app.name.toLowerCase().includes(keyword) ||
            app.domain.toLowerCase().includes(keyword) ||
            app.path.toLowerCase().includes(keyword)

        const matchStatus = status.value === 'all' || app.status === status.value

        return matchSearch && matchStatus
    })
})

const openCreateModal = () => {
    modalType.value = 'create'
    selectedApp.value = null
    isModalOpen.value = true
}

const openEditModal = (app: any) => {
    modalType.value = 'edit'
    selectedApp.value = app
    isModalOpen.value = true
}

const handleSubmit = (payload: any) => {
    if (modalType.value === 'create') {
        apps.value.unshift({
            id: Date.now(),
            status: 'stopped',
            ...payload
        })
    } else {
        const index = apps.value.findIndex((item) => item.id === selectedApp.value?.id)

        if (index !== -1) {
            apps.value[index] = {
                ...apps.value[index],
                ...payload
            }
        }
    }

    isModalOpen.value = false
}

const restartApp = (app: any) => {
    console.log('restart app', app)
}

const stopApp = (app: any) => {
    console.log('stop app', app)
}

const viewLogs = (app: any) => {
    console.log('view logs', app)
}
</script>