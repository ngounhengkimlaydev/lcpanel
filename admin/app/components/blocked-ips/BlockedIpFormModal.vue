<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-3xl'
    }"
  >
    <template #content>
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-bold text-highlighted">
              {{ item ? 'Edit Blocked IP' : 'Block New IP' }}
            </h3>
            <p class="text-sm text-muted">
              Add an IP to the firewall block list or update existing block settings.
            </p>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="IP Address" required>
            <UInput
              v-model="form.ip"
              placeholder="Example: 192.168.1.10"
            />
          </UFormField>

          <UFormField label="Country">
            <UInput
              v-model="form.country"
              placeholder="Example: Cambodia"
            />
          </UFormField>

          <UFormField label="Type">
            <USelect
              v-model="form.type"
              :items="typeOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Scope">
            <USelect
              v-model="form.scope"
              :items="scopeOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="statusOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Attempts">
            <UInput
              v-model.number="form.attempts"
              type="number"
              min="0"
            />
          </UFormField>

          <UFormField label="Expires At">
            <UInput
              v-model="form.expiresAt"
              type="datetime-local"
            />
          </UFormField>

          <UFormField label="Reason" required class="md:col-span-2">
            <UTextarea
              v-model="form.reason"
              :rows="4"
              placeholder="Why this IP is blocked..."
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="soft"
              @click="open = false"
            >
              Cancel
            </UButton>

            <UButton
              icon="i-lucide-save"
              @click="submit"
            >
              {{ item ? 'Save Changes' : 'Block IP' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type {
  BlockedIp,
  BlockedIpForm
} from '~/types/blocked-ip'

type SelectOption = {
  label: string
  value: string
}

const props = defineProps<{
  item: BlockedIp | null
  statusOptions: SelectOption[]
  scopeOptions: SelectOption[]
  typeOptions: SelectOption[]
}>()

const emit = defineEmits<{
  submit: [form: BlockedIpForm]
}>()

const open = defineModel<boolean>('open', {
  default: false
})

const form = reactive<BlockedIpForm>({
  ip: '',
  reason: '',
  country: '',
  attempts: 0,
  type: 'manual',
  scope: 'global',
  status: 'active',
  expiresAt: ''
})

watch(open, (value) => {
  if (!value) return

  if (props.item) {
    Object.assign(form, {
      ip: props.item.ip,
      reason: props.item.reason,
      country: props.item.country,
      attempts: props.item.attempts,
      type: props.item.type,
      scope: props.item.scope,
      status: props.item.status,
      expiresAt: props.item.expiresAt || ''
    })

    return
  }

  resetForm()
})

function resetForm() {
  Object.assign(form, {
    ip: '',
    reason: '',
    country: '',
    attempts: 0,
    type: 'manual',
    scope: 'global',
    status: 'active',
    expiresAt: ''
  })
}

function submit() {
  if (!form.ip.trim()) return
  if (!form.reason.trim()) return

  emit('submit', { ...form })

  open.value = false
}
</script>