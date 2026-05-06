<template>
  <div class="space-y-6">
    <!-- Server Health -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UCard class="relative overflow-hidden">
        <div class="absolute -right-8 -top-8 size-28 rounded-full bg-primary/10" />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">CPU Usage</p>
            <h3 class="mt-2 text-3xl font-bold">{{ Number(stats?.cpu ?? 0).toFixed(1) }}%</h3>
            <p>{{ stats?.cores ?? '0' }}Cores</p>
            <p class="mt-2 text-sm" :class="`text-${statusColor(Number(stats?.cpu ?? 0))}`">
              {{ healthText(Number(stats?.cpu ?? 0)) }}
            </p>
          </div>
          <div class="rounded-2xl bg-primary/10 p-3 text-primary">
            <UIcon name="i-lucide-cpu" class="size-7" />
          </div>
        </div>
      </UCard>

      <UCard class="relative overflow-hidden">
        <div class="absolute -right-8 -top-8 size-28 rounded-full bg-info/10" />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">RAM Usage</p>
            <h3 class="mt-2 text-3xl font-bold">{{ stats?.ramUsed ?? '0' }}GB</h3>
            <p>of {{ stats?.ramTotal ?? '0' }}GB</p>
            <p class="mt-2 text-sm" :class="`text-${statusColor(Number(stats?.ram ?? 0))}`">
              {{ healthText(Number(stats?.ram ?? 0)) }}
            </p>
          </div>
          <div class="rounded-2xl bg-info/10 p-3 text-info">
            <UIcon name="i-lucide-memory-stick" class="size-7" />
          </div>
        </div>
      </UCard>

      <UCard class="relative overflow-hidden">
        <div class="absolute -right-8 -top-8 size-28 rounded-full bg-success/10" />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">Disk Usage</p>
            <h3 class="mt-2 text-3xl font-bold">{{ (stats?.diskUsed / 1024 / 1024 / 1024).toFixed(2) }}GB</h3>
            <p>of {{ (stats?.diskTotal / 1024 / 1024 / 1024).toFixed(2) }}GB</p>
            <p class="mt-2 text-sm" :class="`text-${statusColor(Number(stats?.disk ?? 0))}`">
              {{ healthText(Number(stats?.disk ?? 0)) }}
            </p>
          </div>
          <div class="rounded-2xl bg-success/10 p-3 text-success">
            <UIcon name="i-lucide-hard-drive" class="size-7" />
          </div>
        </div>
      </UCard>

      <UCard class="relative overflow-hidden">
        <div class="absolute -right-8 -top-8 size-28 rounded-full bg-warning/10" />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">Active Sites</p>
            <h3 class="mt-2 text-3xl font-bold"> {{ activeSitesCount }}</h3>
            <p>of {{ totalSSL }}</p>
            <p class="mt-2 text-sm" :class="sslExpiringCount > 0 ? 'text-warning' : 'text-success'">
              {{
                sslExpiringCount > 0
                  ? `${sslExpiringCount} SSL issues`
                  : 'All SSL active'
              }}
            </p>
          </div>
          <div class="rounded-2xl bg-warning/10 p-3 text-warning">
            <UIcon name="i-lucide-globe-2" class="size-7" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <UCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold">Resource Monitor</h2>
              <p class="text-sm text-muted">CPU, RAM, disk and bandwidth overview</p>
            </div>
            <UBadge :color="socketConnected ? 'success' : 'error'" variant="soft">
              {{ socketConnected ? 'Server Online' : 'Server Offline' }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-5">
          <div>
            <div class="mb-2 flex justify-between text-sm">
              <span class="text-muted">CPU</span>
              <span class="font-medium"> {{ Number(stats?.cpu ?? 0).toFixed(1) }}%</span>
            </div>
            <UProgress :model-value="Number(stats?.cpu ?? 0)" :color="statusColor(Number(stats?.cpu ?? 0))" />
          </div>

          <div>
            <div class="mb-2 flex justify-between text-sm">
              <span class="text-muted">RAM</span>
              <span class="font-medium"> {{ Number(stats?.ram ?? 0).toFixed(1) }}%</span>
            </div>
            <UProgress :model-value="Number(stats?.ram ?? 0)" :color="statusColor(Number(stats?.ram ?? 0))" />
          </div>

          <div>
            <div class="mb-2 flex justify-between text-sm">
              <span class="text-muted">Disk</span>
              <span class="font-medium"> {{ Number(stats?.disk ?? 0).toFixed(1) }}%</span>
            </div>
            <UProgress :model-value="Number(stats?.disk ?? 0)" :color="statusColor(Number(stats?.disk ?? 0))" />
          </div>

          <div>
            <div class="mb-2 flex justify-between text-sm">
              <span class="text-muted">Bandwidth</span>
              <span class="font-medium"> {{ stats?.bandwidth?.total ?? '0.00' }}GB</span>
            </div>
            <UProgress :model-value="Number(stats?.bandwidth?.total ?? 0)" color="warning" />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h2 class="text-base font-semibold">Quick Actions</h2>
            <p class="text-sm text-muted">Common server operations</p>
          </div>
        </template>

        <div class="grid gap-3">
          <UButton block icon="i-lucide-globe" label="Create Website" />
          <UButton block icon="i-lucide-database" color="neutral" variant="outline" label="Create Database" />
          <UButton block icon="i-lucide-lock" color="neutral" variant="outline" label="Issue SSL" />
          <UButton block icon="i-lucide-terminal" color="neutral" variant="outline" label="Deploy Node App" />
          <UButton block icon="i-lucide-rotate-cw" color="neutral" variant="outline" label="Restart PM2" />
        </div>
      </UCard>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <UCard class="xl:col-span-2">
        <template #header>
          <div>
            <h2 class="text-base font-semibold">Hosted Websites</h2>
            <p class="text-sm text-muted">Domains, SSL and app status</p>
          </div>
        </template>

        <div class="space-y-3">
          <div v-for="site in sites" :key="site.domain"
            class="flex items-center justify-between rounded-xl border border-default p-4">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-primary/10 p-2 text-primary">
                <UIcon name="i-lucide-server" class="size-5" />
              </div>
              <div>
                <p class="font-medium">{{ site.domain }}</p>
                <p class="text-sm text-muted">{{ site.type }} · {{ site.port }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <UBadge :color="site.ssl ? 'success' : 'warning'" variant="soft">
                {{ site.ssl ? 'SSL Active' : 'No SSL' }}
              </UBadge>
              <UBadge color="success" variant="soft">Online</UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h2 class="text-base font-semibold">Security Center</h2>
            <p class="text-sm text-muted">Firewall and service status</p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Firewall</span>
            <UBadge :color="stats?.security?.firewall ? 'success' : 'error'" variant="soft">
              {{ stats?.security?.firewall ? 'Enabled' : 'Disabled' }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">SSH</span>
            <UBadge :color="stats?.security?.ssh ? 'success' : 'error'" variant="soft">
              {{ stats?.security?.ssh ? 'Port 22 Open' : 'Closed' }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">HTTP / HTTPS</span>
            <UBadge :color="stats?.security?.http ? 'success' : 'error'" variant="soft">
              HTTP {{ stats?.security?.http ? 'Open' : 'Closed' }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">Mail Port 25</span>
            <UBadge :color="stats?.security?.mail ? 'success' : 'warning'" variant="soft">
              {{ stats?.security?.mail ? 'Open' : 'Blocked' }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const fetch = useApiFetch()
const { $socket } = useNuxtApp();
const stats = ref<any>(null)
const loading = ref(false)
const socketConnected = ref(false)
const loadStats = async () => {
  loading.value = true
  try {
    const res = await fetch.get('/server', {}, false)
    stats.value = res

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
const sites = computed(() => stats.value?.sites ?? [])

const activeSitesCount = computed(() => sites.value.length)

const sslExpiringCount = computed(() => {
  return sites.value.filter((s: any) => !s.ssl).length
})

const totalSSL = computed(() => {
  return sites.value.filter((s: any) => s.ssl).length
})


onMounted(() => {
  loadStats()

  $socket.off('server:status')
  $socket.off('connect')
  $socket.off('disconnect')
  $socket.off('connect_error')

  socketConnected.value = $socket.connected

  $socket.on('connect', () => {
    socketConnected.value = true
  })

  $socket.on('disconnect', () => {
    socketConnected.value = false
  })

  $socket.on('connect_error', () => {
    socketConnected.value = false
  })

  $socket.on('server:status', (data: any) => {
    stats.value = data
  })
})

onUnmounted(() => {
  $socket.off('server:status')
  $socket.off('connect')
  $socket.off('disconnect')
  $socket.off('connect_error')
})

const statusColor = (value?: number) => {
  if (!value) return 'neutral'
  if (value >= 90) return 'error'
  if (value >= 70) return 'warning'
  return 'success'
}

const isServerOnline = computed(() => {
  return socketConnected.value && !!stats.value?.success && !loading.value
})

const serverStatus = computed(() => {
  if (loading.value && !stats.value) {
    return { label: 'Checking...', color: 'neutral' as const }
  }

  if (!socketConnected.value) {
    return { label: 'Server Offline', color: 'error' as const }
  }

  if (!stats.value?.success) {
    return { label: 'Server Offline', color: 'error' as const }
  }

  if (Number(stats.value?.disk ?? 0) >= 95) {
    return { label: 'Critical', color: 'error' as const }
  }

  if (Number(stats.value?.ram ?? 0) >= 85) {
    return { label: 'Warning', color: 'warning' as const }
  }

  return { label: 'Server Online', color: 'success' as const }
})

const healthText = (value: number) => {
  if (value >= 90) return 'Critical usage'
  if (value >= 70) return 'High usage'
  return 'Healthy load'
}


</script>