<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-bold text-highlighted">
        Website Information
      </h3>
    </template>

    <div class="space-y-8">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Website Type" required>
          <USelect
            v-model="form.website_type"
            :items="websiteTypes"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Domain" required>
          <UInput
            v-model="form.domain"
            placeholder="example.com"
            class="w-full"
            @update:model-value="generateDefaults"
          />
        </UFormField>

        <UFormField label="Website Name" required>
          <UInput
            v-model="form.website_name"
            placeholder="My Website"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Document Root">
          <UInput
            v-model="form.document_root"
            placeholder="/var/www/example.com"
            class="w-full"
          />
        </UFormField>
      </div>

      <USeparator label="Runtime Config" />

      <div
        v-if="isPhpWebsite"
        class="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <UFormField label="PHP Version">
          <USelect
            v-model="form.php_version"
            :items="phpVersions"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Web Server">
          <USelect
            v-model="form.web_server"
            :items="webServers"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="form.website_type === 'laravel'" label="Laravel Public Path">
          <UInput
            v-model="form.public_path"
            placeholder="/public"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="form.website_type === 'laravel'" label="Queue Driver">
          <USelect
            v-model="form.queue_driver"
            :items="queueDrivers"
            class="w-full"
          />
        </UFormField>
      </div>

      <div
        v-if="form.website_type === 'reverse_proxy'"
        class="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <UFormField label="Proxy Target" required>
          <UInput
            v-model="form.proxy_target"
            placeholder="http://127.0.0.1:3000"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Proxy Port">
          <UInput
            v-model.number="form.proxy_port"
            type="number"
            placeholder="3000"
            class="w-full"
          />
        </UFormField>

        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">WebSocket Support</p>
              <p class="text-sm text-muted">Enable proxy upgrade headers.</p>
            </div>

            <USwitch v-model="form.websocket" />
          </div>
        </div>
      </div>

      <div
        v-if="form.website_type === 'static'"
        class="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <UFormField label="Index File">
          <UInput
            v-model="form.index_file"
            placeholder="index.html"
            class="w-full"
          />
        </UFormField>

        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">SPA Fallback</p>
              <p class="text-sm text-muted">Fallback all routes to index.html.</p>
            </div>

            <USwitch v-model="form.spa_fallback" />
          </div>
        </div>
      </div>

      <USeparator label="Security" />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">Free SSL</p>
              <p class="text-sm text-muted">Issue SSL certificate for this domain.</p>
            </div>

            <USwitch v-model="form.ssl" />
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">Force HTTPS</p>
              <p class="text-sm text-muted">Redirect all HTTP traffic to HTTPS.</p>
            </div>

            <USwitch v-model="form.force_https" />
          </div>
        </div>
      </div>

      <USeparator label="Database" />

      <div class="space-y-4">
        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">Create Database</p>
              <p class="text-sm text-muted">Create MySQL database for this website.</p>
            </div>

            <USwitch v-model="form.create_database" />
          </div>
        </div>

        <div
          v-if="form.create_database"
          class="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <UFormField label="Database Name">
            <UInput v-model="form.database_name" class="w-full" />
          </UFormField>

          <UFormField label="Database User">
            <UInput v-model="form.database_user" class="w-full" />
          </UFormField>

          <UFormField label="Database Password">
            <UInput
              v-model="form.database_password"
              type="password"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <USeparator label="FTP Account" />

      <div class="space-y-4">
        <div class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-highlighted">Create FTP Account</p>
              <p class="text-sm text-muted">Allow file upload through FTP/SFTP.</p>
            </div>

            <USwitch v-model="form.create_ftp" />
          </div>
        </div>

        <div
          v-if="form.create_ftp"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <UFormField label="FTP Username">
            <UInput v-model="form.ftp_user" class="w-full" />
          </UFormField>

          <UFormField label="FTP Password">
            <UInput
              v-model="form.ftp_password"
              type="password"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          to="/websites"
        />

        <UButton
          label="Create Website"
          icon="i-lucide-globe"
          @click="submit"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { CreateWebsitePayload } from '~/types/website';


const emit = defineEmits<{
  submit: [payload: CreateWebsitePayload]
}>()

const websiteTypes = [
  { label: 'Static Website', value: 'static' },
  { label: 'PHP Website', value: 'php' },
  { label: 'Laravel Website', value: 'laravel' },
  { label: 'WordPress Website', value: 'wordpress' },
  { label: 'Reverse Proxy', value: 'reverse_proxy' }
]

const phpVersions = [
  { label: 'PHP 8.3', value: '8.3' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 7.4', value: '7.4' }
]

const webServers = [
  { label: 'Nginx', value: 'nginx' },
  { label: 'Apache', value: 'apache' }
]

const queueDrivers = [
  { label: 'Sync', value: 'sync' },
  { label: 'Database', value: 'database' },
  { label: 'Redis', value: 'redis' }
]

const form = reactive<CreateWebsitePayload>({
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

const isPhpWebsite = computed(() => {
  return ['php', 'laravel', 'wordpress'].includes(form.website_type)
})

watch(
  () => form.website_type,
  (type) => {
    if (type === 'static') {
      form.create_database = false
      form.create_ftp = false
      form.spa_fallback = true
    }

    if (type === 'php') {
      form.create_database = true
      form.spa_fallback = false
    }

    if (type === 'laravel') {
      form.create_database = true
      form.public_path = '/public'
      form.queue_driver = 'database'
    }

    if (type === 'wordpress') {
      form.create_database = true
      form.public_path = ''
    }

    if (type === 'reverse_proxy') {
      form.create_database = false
      form.create_ftp = false
      form.proxy_port = form.proxy_port || 3000
      form.proxy_target = form.proxy_target || 'http://127.0.0.1:3000'
    }
  }
)

function cleanDomain(value: string) {
  return value
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .toLowerCase()
}

function generateDefaults() {
  const domain = cleanDomain(form.domain)

  form.domain = domain
  form.website_name = domain || ''
  form.document_root = domain ? `/var/www/${domain}` : '/var/www/'

  const safeName = domain.replaceAll('.', '_').replaceAll('-', '_')

  form.database_name = safeName ? `${safeName}_db` : ''
  form.database_user = safeName ? `${safeName}_user` : ''
  form.ftp_user = safeName ? `${safeName}_ftp` : ''

  if (form.website_type === 'reverse_proxy') {
    form.proxy_target = `http://127.0.0.1:${form.proxy_port || 3000}`
  }
}

function submit() {
  emit('submit', { ...form })
}
</script>