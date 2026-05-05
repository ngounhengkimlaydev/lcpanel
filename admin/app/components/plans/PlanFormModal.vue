<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">
            {{ type === 'create' ? 'Create Plan' : 'Edit Plan' }}
          </h3>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Plan Name">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>

          <UFormField label="Price">
            <UInput v-model.number="form.price" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Status">
            <USelect v-model="form.status" :items="statuses" class="w-full" />
          </UFormField>

          <UFormField label="Disk Space">
            <UInput v-model="form.disk" class="w-full" />
          </UFormField>

          <UFormField label="Bandwidth">
            <UInput v-model="form.bandwidth" class="w-full" />
          </UFormField>

          <UFormField label="Domains">
            <UInput v-model.number="form.domains" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Databases">
            <UInput v-model.number="form.databases" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Emails">
            <UInput v-model.number="form.emails" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Free SSL">
            <USwitch v-model="form.ssl" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="open = false"
            />

            <UButton
              :label="type === 'create' ? 'Create Plan' : 'Save Changes'"
              icon="i-lucide-save"
              @click="submit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Plan } from '~/types';

const props = defineProps<{
  type: 'create' | 'edit'
  plan: Plan | null
}>()

const emit = defineEmits<{
  submit: [plan: Plan]
}>()

const open = defineModel<boolean>('open', { default: false })

const statuses = ['active', 'draft', 'disabled']

const form = reactive<Plan>({
  id: 0,
  name: '',
  price: 0,
  status: 'active',
  customers: 0,
  disk: '',
  bandwidth: '',
  domains: 1,
  databases: 1,
  emails: 1,
  ssl: true
})

watch(
  () => open.value,
  (value) => {
    if (!value) return

    if (props.type === 'edit' && props.plan) {
      Object.assign(form, props.plan)
    } else {
      Object.assign(form, {
        id: 0,
        name: '',
        price: 0,
        status: 'active',
        customers: 0,
        disk: '',
        bandwidth: '',
        domains: 1,
        databases: 1,
        emails: 1,
        ssl: true
      })
    }
  }
)

function submit() {
  emit('submit', { ...form })
}
</script>