<template>
  <UDashboardPanel id="logs">
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Logs
              </h3>

              <UButton
                icon="i-lucide-chart-no-axes-column"
                label="View Log Dashboard"
                @click="dashboard = true"
              />
            </div>
          </template>

          <LogToolbar
            :search="search"
            :level="level"
            @update:search="search = $event"
            @update:level="level = $event"
          />

          <LogTable
            :logs="filteredLogs"
            @delete="deleteLog"
          />
        </UCard>
      </div>

      <USlideover v-model:open="dashboard" title="Log Dashboard">
        <template #body>
          <LogStats :logs="logs" />
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import LogStats from '~/components/logs/LogStats.vue'
import LogTable from '~/components/logs/LogTable.vue'
import LogToolbar from '~/components/logs/LogToolbar.vue'
import type { ServerLog } from '~/types/log'

definePageMeta({
  middleware: ['super-admin']
})

const search = ref('')
const level = ref('all')
const dashboard = ref(false)

const logs = ref<ServerLog[]>([
  {
    id: 1,
    level: 'success',
    source: 'Nginx',
    message: 'Nginx service restarted successfully',
    ip: '116.212.144.96',
    user: 'root',
    created_at: '2026-05-07 16:45'
  },
  {
    id: 2,
    level: 'info',
    source: 'PM2',
    message: 'Application lcpanel-api is online',
    ip: '127.0.0.1',
    user: 'lay',
    created_at: '2026-05-07 16:30'
  },
  {
    id: 3,
    level: 'warning',
    source: 'SSH',
    message: 'Failed login attempt detected',
    ip: '87.251.64.144',
    user: 'unknown',
    created_at: '2026-05-07 15:58'
  },
  {
    id: 4,
    level: 'error',
    source: 'API',
    message: 'Request failed with status code 520',
    ip: '116.212.144.96',
    user: 'admin',
    created_at: '2026-05-07 15:22'
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter((item) => {
    const matchSearch =
      item.source.toLowerCase().includes(search.value.toLowerCase()) ||
      item.message.toLowerCase().includes(search.value.toLowerCase()) ||
      item.ip.toLowerCase().includes(search.value.toLowerCase()) ||
      item.user.toLowerCase().includes(search.value.toLowerCase())

    const matchLevel = level.value === 'all' || item.level === level.value

    return matchSearch && matchLevel
  })
})

function deleteLog(log: ServerLog) {
  logs.value = logs.value.filter((item) => item.id !== log.id)
}
</script>