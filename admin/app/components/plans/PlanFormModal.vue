<template>
  <UModal v-model:open="open" :ui="{
    content: 'max-w-2xl'
  }">
    <template #header>
      <h3 class="text-lg font-bold text-highlighted">
        {{ type === 'create' ? 'Create Plan' : 'Edit Plan' }}
      </h3>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Plan Name" required>
          <UInput v-model="form.name" class="w-full" />
        </UFormField>

        <UFormField label="Plan Type" required>
          <USelect v-model="form.type" :items="typeItems" class="w-full" />
        </UFormField>

        <UFormField label="Description" class="md:col-span-2" required>
          <UTextarea v-model="form.description" :rows="3" class="w-full" />
        </UFormField>

        <UFormField label="Price ($)" required>
          <UInput v-model.number="form.price" type="number" min="0" step="0.01" class="w-full" />
        </UFormField>

        <UFormField label="Status">
          <USelect v-model="form.status" :items="statusItems" class="w-full" />
        </UFormField>

        <UFormField label="Disk Space (MB)" required>
          <UInput v-model.number="form.disk_space" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="Bandwidth (GB)" required>
          <UInput v-model.number="form.bandwidth" type="number" min="0" step="0.5" class="w-full" />
        </UFormField>

        <UFormField label="Domains" required>
          <UInput v-model.number="form.domain" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Websites">
          <UInput v-model.number="form.website" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="Databases" required>
          <UInput v-model.number="form.database" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Emails">
          <UInput v-model.number="form.email" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="CPU Cores">
          <UInput v-model.number="form.cpu" type="number" min="0" step="0.1" class="w-full" />
        </UFormField>

        <UFormField label="RAM (MB)">
          <UInput v-model.number="form.ram" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="FTP Accounts">
          <UInput v-model.number="form.ftp_account" type="number" min="0" class="w-full" />
        </UFormField>

        <UFormField label="Cron Jobs">
          <UInput v-model.number="form.cronjob" type="number" min="0" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 xl:grid-cols-3">
          <UFormField label="Free SSL" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Include free SSL certificate</p>
              <USwitch v-model="form.ssl" />
            </div>
          </UFormField>

          <UFormField label="Backup" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Automatic backup access</p>
              <USwitch v-model="form.backup" />
            </div>
          </UFormField>

          <UFormField label="CDN" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Content delivery network</p>
              <USwitch v-model="form.cdn" />
            </div>
          </UFormField>

          <UFormField label="Staging" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Staging environment</p>
              <USwitch v-model="form.staging" />
            </div>
          </UFormField>

          <UFormField label="SSH Access" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Terminal and deploy access</p>
              <USwitch v-model="form.ssh_access" />
            </div>
          </UFormField>

          <UFormField label="Docker Support" class="rounded-xl border border-default px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">Container-based workloads</p>
              <USwitch v-model="form.docker_support" />
            </div>
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />

        <UButton :label="type === 'create' ? 'Create Plan' : 'Save Changes'" icon="i-lucide-save" @click="submit" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Plan } from '~/types'
import { createDefaultPlan, planStatusItems, planTypeItems } from '~/utils/plan'

const props = defineProps<{
  type: 'create' | 'edit'
  plan: Plan | null
}>()

const emit = defineEmits<{
  submit: [plan: Plan]
}>()

const open = defineModel<boolean>('open', { default: false })

const statusItems = planStatusItems
const typeItems = planTypeItems

const form = reactive<Plan>(createDefaultPlan())

function resetForm() {
  Object.assign(form, createDefaultPlan())
}

watch(
  () => open.value,
  (value) => {
    if (!value) return

    if (props.type === 'edit' && props.plan) {
      Object.assign(form, createDefaultPlan(), props.plan)
    } else {
      resetForm()
    }
  }
)

function submit() {
  emit('submit', {
    ...form,
    name: form.name.trim(),
    description: form.description.trim()
  })
}
</script>
