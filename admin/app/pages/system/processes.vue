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
                                <UButton
                                    icon="i-lucide-chart-no-axes-column"
                                    label="View Process Dashboard"
                                    @click="dashboard = true"
                                />

                                <UButton
                                    icon="i-lucide-refresh-cw"
                                    label="Refresh"
                                    :loading="loading"
                                    @click="refreshProcesses"
                                />
                            </div>
                        </div>
                    </template>

                    <ProcessToolbar
                        v-model:search="search"
                        v-model:status="status"
                        @refresh="refreshProcesses"
                    />

                    <ProcessTable
                        :processes="filteredProcesses"
                        :show-actions="false"
                    />
                </UCard>
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
import type { ProcessStatus, ServerProcess } from '~/types'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.PROCESS,
})

const api = useApiFetch()
const toast = useToast()

const search = ref('')
const status = ref<ProcessStatus | 'all'>('all')
const dashboard = ref(false)
const loading = ref(false)
const processes = ref<ServerProcess[]>([])

const filteredProcesses = computed(() => {
    return processes.value.filter((item) => {
        const keyword = search.value.toLowerCase()
        const matchSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.user.toLowerCase().includes(keyword) ||
            item.command.toLowerCase().includes(keyword) ||
            String(item.pid).includes(search.value)

        const matchStatus = status.value === 'all' || item.status === status.value

        return matchSearch && matchStatus
    })
})

async function loadProcesses(showToast = false) {
    loading.value = true

    try {
        const res: any = await api.get('/server/processes', undefined, false)
        processes.value = res.data || []

        if (showToast) {
            toast.add({
                title: 'Processes refreshed',
                color: 'success'
            })
        }
    } catch (error: any) {
        toast.add({
            title: 'Failed to load processes',
            description: error?.data?.message || error?.message,
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

async function refreshProcesses() {
    await loadProcesses(true)
}

onMounted(() => {
    loadProcesses()
})
</script>
