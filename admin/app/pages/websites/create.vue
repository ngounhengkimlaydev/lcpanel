<template>
    <UDashboardPanel id="create-website">
        <template #default>
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-highlighted">
                            Create Website
                        </h1>
                        <p class="text-sm text-muted">
                            Add a new website with domain, SSL, database and FTP configuration.
                        </p>
                    </div>

                    <UButton icon="i-lucide-arrow-left" label="Back to Websites" color="neutral" variant="outline"
                        to="/websites" />
                </div>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div class="space-y-6 xl:col-span-2">
                        <CreateWebsiteForm @submit="handleSubmit" />
                    </div>

                    <div class="space-y-6">
                        <CreateWebsiteSummary :form="previewForm" />
                        <CreateWebsiteTips />
                    </div>
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import CreateWebsiteForm from '~/components/websites/create/CreateWebsiteForm.vue'
import CreateWebsiteSummary from '~/components/websites/create/CreateWebsiteSummary.vue'
import CreateWebsiteTips from '~/components/websites/create/CreateWebsiteTips.vue'
import type { CreateWebsitePayload } from '~/types/website'

definePageMeta({
    middleware: ['super-admin']
})

const previewForm = ref<CreateWebsitePayload>({
    website_type: 'php',
    domain: '',
    website_name: '',
    document_root: '/var/www/',

    web_server: 'nginx',
    php_version: '8.3',
    public_path: '/public',
    queue_driver: 'database',

    proxy_target: '',
    proxy_port: 3000,
    websocket: true,

    index_file: 'index.html',
    spa_fallback: false,

    ssl: true,
    force_https: true,

    create_database: true,
    database_name: '',
    database_user: '',
    database_password: '',

    create_ftp: false,
    ftp_user: '',
    ftp_password: '',

    status: 'active'
})

function handleSubmit(payload: CreateWebsitePayload) {
    previewForm.value = payload
    console.log('Create website payload:', payload)
    navigateTo('/websites')
}
</script>