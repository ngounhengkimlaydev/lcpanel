<template>
  <UDashboardPanel id="websites">
    <template #default>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Websites
              </h3>

              <div class="flex gap-2">
                <UButton icon="i-lucide-chart-no-axes-column" label="View Website Dashboard"
                  @click="dashboard = true" />

                <UButton icon="i-lucide-plus" label="Create Website" to="/websites/create" />
              </div>
            </div>
          </template>

          <WebsiteToolbar :search="search" :status="status" @update:search="search = $event"
            @update:status="status = $event" />

          <WebsiteTable :websites="filteredWebsites" @delete="deleteWebsite" />
        </UCard>
      </div>

      <USlideover v-model:open="dashboard" title="Website Dashboard">
        <template #body>
          <WebsiteStats :websites="websites" />
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WebsiteStats from '~/components/websites/WebsiteStats.vue'
import WebsiteTable from '~/components/websites/WebsiteTable.vue'
import WebsiteToolbar from '~/components/websites/WebsiteToolbar.vue'
import type { Website } from '~/types/website'

definePageMeta({
  middleware: ['super-admin']
})

const search = ref('')
const status = ref('all')
const dashboard = ref(false)

const websites = ref<Website[]>([
  {
    id: 1,
    domain: 'ltech.digital',
    owner: 'LTech Digital',
    document_root: '/var/www/ltech.digital',
    php_version: '8.3',
    ssl: true,
    status: 'active',
    storage: '2.4 GB',
    bandwidth: '18.6 GB',
    created_at: '2026-05-07'
  },
  {
    id: 2,
    domain: 'taskio.site',
    owner: 'Taskio',
    document_root: '/var/www/taskio.site',
    php_version: '8.2',
    ssl: true,
    status: 'active',
    storage: '890 MB',
    bandwidth: '6.2 GB',
    created_at: '2026-05-06'
  },
  {
    id: 3,
    domain: 'demo-client.com',
    owner: 'Demo Client',
    document_root: '/var/www/demo-client.com',
    php_version: '8.1',
    ssl: false,
    status: 'pending',
    storage: '120 MB',
    bandwidth: '1.1 GB',
    created_at: '2026-05-05'
  }
])

const filteredWebsites = computed(() => {
  return websites.value.filter((item) => {
    const matchSearch =
      item.domain.toLowerCase().includes(search.value.toLowerCase()) ||
      item.owner.toLowerCase().includes(search.value.toLowerCase()) ||
      item.document_root.toLowerCase().includes(search.value.toLowerCase())

    const matchStatus = status.value === 'all' || item.status === status.value

    return matchSearch && matchStatus
  })
})

function deleteWebsite(website: Website) {
  websites.value = websites.value.filter((item) => item.id !== website.id)
}
</script>