<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">
            {{ type === 'create' ? 'Add Customer' : 'Edit Customer' }}
          </h3>
        </template>

        <div class="space-y-4">
          <UFormField label="Name">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>

          <UFormField label="Email">
            <UInput v-model="form.email" class="w-full" />
          </UFormField>

          <UFormField label="Plan">
            <USelect v-model="form.plan" :items="plans" class="w-full" />
          </UFormField>

          <UFormField label="Websites">
            <UInput v-model.number="form.websites" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Storage">
            <UInput v-model="form.storage" class="w-full" />
          </UFormField>

          <UFormField label="Status">
            <USelect v-model="form.status" :items="statuses" class="w-full" />
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
              :label="type === 'create' ? 'Create Customer' : 'Save Changes'"
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
type Customer = {
  id: number
  name: string
  email: string
  plan: string
  websites: number
  storage: string
  status: string
  created_at: string
}

const props = defineProps<{
  type: 'create' | 'edit'
  customer: Customer | null
}>()

const emit = defineEmits<{
  submit: [customer: Customer]
}>()

const open = defineModel<boolean>('open', { default: false })

const plans = ['Basic', 'Business', 'Enterprise']
const statuses = ['active', 'suspended', 'inactive']

const form = reactive<Customer>({
  id: 0,
  name: '',
  email: '',
  plan: 'Basic',
  websites: 1,
  storage: '0 GB',
  status: 'active',
  created_at: ''
})

watch(
  () => open.value,
  (value) => {
    if (!value) return

    if (props.type === 'edit' && props.customer) {
      Object.assign(form, props.customer)
    } else {
      Object.assign(form, {
        id: 0,
        name: '',
        email: '',
        plan: 'Basic',
        websites: 1,
        storage: '0 GB',
        status: 'active',
        created_at: ''
      })
    }
  }
)

function submit() {
  emit('submit', { ...form })
}
</script>