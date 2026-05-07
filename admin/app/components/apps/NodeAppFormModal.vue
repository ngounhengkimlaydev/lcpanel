<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">
            {{ type === 'create' ? 'Create Node App' : 'Edit Node App' }}
          </h3>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="App Name">
            <UInput v-model="form.name" placeholder="lcpanel-api" />
          </UFormField>

          <UFormField label="Domain">
            <UInput v-model="form.domain" placeholder="api.example.com" />
          </UFormField>

          <UFormField label="App Path">
            <UInput v-model="form.path" placeholder="/var/www/app" />
          </UFormField>

          <UFormField label="Startup File">
            <UInput v-model="form.startup" placeholder="dist/main.js" />
          </UFormField>

          <UFormField label="Runtime">
            <USelect v-model="form.runtime" :items="runtimeItems" />
          </UFormField>

          <UFormField label="Port">
            <UInput v-model="form.port" type="number" placeholder="3000" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="soft"
              @click="open = false"
            />

            <UButton
              :label="type === 'create' ? 'Create App' : 'Save Changes'"
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
const props = defineProps<{
  type: 'create' | 'edit'
  app?: any | null
}>()

const emit = defineEmits<{
  submit: [payload: any]
}>()

const open = defineModel<boolean>('open', { default: false })

const form = reactive({
  name: '',
  domain: '',
  path: '',
  startup: '',
  runtime: 'Node 24',
  port: 3000
})

const runtimeItems = [
  { label: 'Node 24', value: 'Node 24' },
  { label: 'Node 22', value: 'Node 22' },
  { label: 'Node 20', value: 'Node 20' },
  { label: 'Node 18', value: 'Node 18' }
]

const resetForm = () => {
  Object.assign(form, {
    name: '',
    domain: '',
    path: '',
    startup: '',
    runtime: 'Node 24',
    port: 3000
  })
}

watch(
  () => open.value,
  (value) => {
    if (!value) return

    if (props.type === 'edit' && props.app) {
      Object.assign(form, props.app)
    } else {
      resetForm()
    }
  }
)

const submit = () => {
  emit('submit', { ...form })
}
</script>