<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-bold text-highlighted">
        Website Information
      </h3>
    </template>

    <div class="space-y-8">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <UFormField label="PHP Version">
          <USelect
            v-model="form.php_version"
            :items="phpVersions"
            class="w-full"
          />
        </UFormField>
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

        <div v-if="form.create_database" class="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <div v-if="form.create_ftp" class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
import type { CreateWebsitePayload } from '~/types/website'

const emit = defineEmits<{
  submit: [payload: CreateWebsitePayload]
}>()

const phpVersions = [
  { label: 'PHP 8.3', value: '8.3' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 7.4', value: '7.4' }
]

const form = reactive<CreateWebsitePayload>({
  domain: '',
  website_name: '',
  document_root: '/var/www/',
  php_version: '8.3',
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
}

function submit() {
  emit('submit', { ...form })
}
</script>