<template>
    <UDashboardPanel id="system-services">
        <template #default>
            <div class="space-y-6">
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">
                                Services
                            </h3>

                            <div class="flex space-x-2">
                                <UButton icon="i-lucide-activity" label="View Service Dashboard"
                                    @click="dashboard = true" />
                                <UButton icon="i-lucide-refresh-cw" label="Refresh" @click="refreshServices" />
                            </div>
                        </div>
                    </template>
                    <ServiceToolbar v-model:search="search" v-model:status="status" />
                    <ServiceTable :services="filteredServices" @start="startService" @stop="stopService"
                        @restart="restartService" />
                </UCard>
            </div>

            <USlideover v-model:open="dashboard" title="Service Dashboard">
                <template #body>
                    <ServiceStats :services="services" />
                </template>
            </USlideover>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import ServiceStats from '~/components/services/ServiceStats.vue'
import ServiceTable from '~/components/services/ServiceTable.vue'
import ServiceToolbar from '~/components/services/ServiceToolbar.vue'
import type { SystemService, SystemServiceStatus } from '~/types'

definePageMeta({
    middleware: ['super-admin']
})

const fetch = useApiFetch()
const toast = useToast()

const search = ref('')
const status = ref<SystemServiceStatus | 'all'>('all')
const dashboard = ref(false)
const services = ref<SystemService[]>([])
const loading = ref(false)

const filteredServices = computed(() => {
    return services.value.filter((item) => {
        const matchStatus = status.value === 'all' || item.status === status.value

        return matchStatus
    })
})

const loadServices = async () => {
    loading.value = true

    try {
        const res = await fetch.paginate('/services', {
            page: 1,
            table_size: 100,
            filter: {
                search: search.value
            },
            sort_by: 'name',
            sort_type: 'asc'
        }, {}, false)

        console.log('SERVICE RESPONSE:', res)

        services.value = res?.data ?? []
    } catch (e: any) {
        console.error(e)

        toast.add({
            title: 'Failed to load services',
            description: e?.data?.message || e?.message,
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

const refreshServices = async () => {
    await loadServices()

    // toast.add({
    //     title: 'Services refreshed',
    //     color: 'success'
    // })
}

const serviceAction = async (
    action: 'start' | 'stop' | 'restart',
    service: SystemService
) => {
    loading.value = true

    try {
        await fetch.post(`/services/${action}`, {
            serviceName: service.name
        })

        toast.add({
            title: `Service ${action} successfully`,
            description: service.name,
            color: 'success'
        })

        await loadServices()
    } catch (e: any) {
        console.error(e)

        toast.add({
            title: `Failed to ${action} service`,
            description: e?.data?.message || e?.message,
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

const startService = (service: SystemService) => {
    return serviceAction('start', service)
}

const stopService = (service: SystemService) => {
    return serviceAction('stop', service)
}

const restartService = (service: SystemService) => {
    return serviceAction('restart', service)
}

watch(search, () => {
    loadServices()
})

onMounted(() => {
    loadServices()
})
</script>