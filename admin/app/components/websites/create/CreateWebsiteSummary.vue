<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-bold text-highlighted">
        Website Summary
      </h3>
    </template>

    <div class="space-y-4">
      <div>
        <p class="text-sm text-muted">Domain</p>
        <p class="font-medium text-highlighted">
          {{ form.domain || 'Not set' }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">Document Root</p>
        <p class="break-all font-medium text-highlighted">
          {{ form.document_root }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted">PHP Version</p>
        <UBadge color="neutral" variant="soft">
          PHP {{ form.php_version }}
        </UBadge>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge :color="form.ssl ? 'success' : 'neutral'" variant="soft">
          SSL {{ form.ssl ? 'Enabled' : 'Disabled' }}
        </UBadge>

        <UBadge :color="form.force_https ? 'success' : 'neutral'" variant="soft">
          HTTPS {{ form.force_https ? 'Forced' : 'Off' }}
        </UBadge>

        <UBadge :color="form.create_database ? 'success' : 'neutral'" variant="soft">
          Database {{ form.create_database ? 'Yes' : 'No' }}
        </UBadge>

        <UBadge :color="form.create_ftp ? 'success' : 'neutral'" variant="soft">
          FTP {{ form.create_ftp ? 'Yes' : 'No' }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CreateWebsitePayload } from '~/types/website'

defineProps<{
  form: CreateWebsitePayload
}>()
</script>