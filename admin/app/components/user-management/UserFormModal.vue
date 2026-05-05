<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon name="i-lucide-user-cog" class="size-5" />
            </div>

            <div>
              <h3 class="text-lg font-bold text-highlighted">
                {{ type === 'create' ? 'Create Admin User' : 'Edit Admin User' }}
              </h3>
              <p class="text-sm text-muted">
                {{ type === 'create' ? 'Add a new admin user.' : 'Update admin user information.' }}
              </p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Name" required>
            <UInput v-model="form.name" icon="i-lucide-user" class="w-full" />
          </UFormField>

          <UFormField label="Email" required>
            <UInput v-model="form.email" icon="i-lucide-mail" class="w-full" />
          </UFormField>

          <UFormField label="Role" required>
            <USelectMenu v-model="selectedRole" :items="roles" searchable class="w-full" />
          </UFormField>

          <UFormField label="Status" required>
            <USelect v-model="form.status" :items="statusItems" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />

            <UButton
              :label="type === 'create' ? 'Create User' : 'Save Changes'"
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
type AdminUser = {
  id: number
  name: string
  email: string
  role: string
  status: string
  last_login: string
  created_at: string
}

type Option = {
  label: string
  value: string
}

const props = defineProps<{
  type: 'create' | 'edit'
  user: AdminUser | null
}>()

const emit = defineEmits<{
  submit: [user: AdminUser]
}>()

const open = defineModel<boolean>('open', { default: false })

const roles: Option[] = [
  { label: 'Super Admin', value: 'Super Admin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Support', value: 'Support' },
  { label: 'Viewer', value: 'Viewer' }
]

const statusItems = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' }
]

const selectedRole = ref<Option>(roles[0]!)

const form = reactive<AdminUser>({
  id: 0,
  name: '',
  email: '',
  role: 'Super Admin',
  status: 'active',
  last_login: '-',
  created_at: ''
})

watch(selectedRole, (role) => {
  if (!role) return
  form.role = role.value
})

watch(open, (value) => {
  if (!value) return

  if (props.type === 'edit' && props.user) {
    Object.assign(form, props.user)

    selectedRole.value =
      roles.find((role) => role.value === props.user?.role) || roles[0]!
  } else {
    Object.assign(form, {
      id: 0,
      name: '',
      email: '',
      role: 'Super Admin',
      status: 'active',
      last_login: '-',
      created_at: ''
    })

    selectedRole.value = roles[0]!
  }
})

function submit() {
  emit('submit', { ...form })
}
</script>