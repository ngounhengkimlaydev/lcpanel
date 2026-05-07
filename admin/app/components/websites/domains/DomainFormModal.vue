<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">
            {{ type === 'create' ? 'Add Domain' : 'Edit Domain' }}
          </h3>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Domain">
            <UInput v-model="form.domain" class="w-full" />
          </UFormField>

          <UFormField label="Website">
            <UInput v-model="form.website" class="w-full" />
          </UFormField>

          <UFormField label="Status">
            <USelect v-model="form.status" :items="statuses" class="w-full" />
          </UFormField>

          <UFormField label="SSL">
            <USwitch v-model="form.ssl" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
            <UButton :label="type === 'create' ? 'Add Domain' : 'Save Changes'" icon="i-lucide-save" @click="submit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { DomainItem } from '~/types/website';


const props = defineProps<{ type: 'create' | 'edit', domain: DomainItem | null }>()
const emit = defineEmits<{ submit: [domain: DomainItem] }>()
const open = defineModel<boolean>('open', { default: false })

const statuses = ['active', 'disabled', 'pending']

const form = reactive<DomainItem>({
  id: 0,
  domain: '',
  website: '',
  ssl: true,
  status: 'active',
  created_at: ''
})

watch(() => open.value, (value) => {
  if (!value) return

  if (props.type === 'edit' && props.domain) {
    Object.assign(form, props.domain)
  } else {
    Object.assign(form, {
      id: 0,
      domain: '',
      website: '',
      ssl: true,
      status: 'active',
      created_at: ''
    })
  }
})

function submit() {
  emit('submit', { ...form })
}
</script>