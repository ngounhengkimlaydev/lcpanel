<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-4xl'
    }"
  >
    <template #content>
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-bold text-highlighted">
              {{ item ? 'Edit Database User' : 'Create Database User' }}
            </h3>
            <p class="text-sm text-muted">
              Manage username, host access, password, assigned databases, and privileges.
            </p>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Username" required>
            <UInput
              v-model="form.username"
              icon="i-lucide-user"
              placeholder="example_user"
            />
          </UFormField>

          <UFormField label="Host" required>
            <UInput
              v-model="form.host"
              icon="i-lucide-server"
              placeholder="localhost, 127.0.0.1, or %"
            />
          </UFormField>

          <UFormField label="Password" :required="!item" class="md:col-span-2">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              icon="i-lucide-key-round"
              :placeholder="item ? 'Leave empty to keep current password' : 'Enter password'"
            >
              <template #trailing>
                <div class="flex items-center gap-1">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-refresh-cw"
                    @click="generatePassword"
                  />

                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="showPassword = !showPassword"
                  />
                </div>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="statusOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Auth Type">
            <USelect
              v-model="form.authType"
              :items="authTypeOptions"
              value-key="value"
            />
          </UFormField>

          <UFormField label="Assigned Databases" class="md:col-span-2">
            <UInput
              v-model="form.assignedDatabases"
              icon="i-lucide-database"
              placeholder="lcpanel_core, client_shop_db"
            />
          </UFormField>

          <UFormField label="Privileges" class="md:col-span-2">
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label
                v-for="privilege in privilegeOptions"
                :key="privilege.value"
                class="flex items-center gap-2 rounded-xl border border-default p-3"
              >
                <UCheckbox
                  :model-value="form.privileges.includes(privilege.value)"
                  @update:model-value="togglePrivilege(privilege.value)"
                />

                <span class="text-sm font-medium text-highlighted">
                  {{ privilege.label }}
                </span>
              </label>
            </div>
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
              {{ item ? 'Save Changes' : 'Create User' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type {
  DatabasePrivilege,
  DatabaseUser,
  DatabaseUserForm
} from '~/types/database-user'

type SelectOption = {
  label: string
  value: string
}

const props = defineProps<{
  item: DatabaseUser | null
  statusOptions: SelectOption[]
  authTypeOptions: SelectOption[]
  privilegeOptions: {
    label: string
    value: DatabasePrivilege
  }[]
}>()

const emit = defineEmits<{
  submit: [form: DatabaseUserForm]
}>()

const toast = useToast()

const open = defineModel<boolean>('open', {
  default: false
})

const showPassword = ref(false)

const form = reactive<DatabaseUserForm>({
  username: '',
  host: 'localhost',
  password: '',
  status: 'active',
  authType: 'password',
  assignedDatabases: '',
  privileges: ['select', 'insert', 'update', 'delete']
})

watch(open, (value) => {
  if (!value) return

  if (props.item) {
    Object.assign(form, {
      username: props.item.username,
      host: props.item.host,
      password: '',
      status: props.item.status,
      authType: props.item.authType,
      assignedDatabases: props.item.assignedDatabases.join(', '),
      privileges: [...props.item.privileges]
    })

    return
  }

  resetForm()
})

function resetForm() {
  Object.assign(form, {
    username: '',
    host: 'localhost',
    password: '',
    status: 'active',
    authType: 'password',
    assignedDatabases: '',
    privileges: ['select', 'insert', 'update', 'delete']
  })
}

function togglePrivilege(value: DatabasePrivilege) {
  if (form.privileges.includes(value)) {
    form.privileges = form.privileges.filter((item) => item !== value)
    return
  }

  form.privileges = [...form.privileges, value]
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'

  form.password = Array.from({ length: 18 }, () => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
}

function submit() {
  if (!form.username.trim()) {
    toast.add({
      title: 'Username is required',
      color: 'error'
    })

    return
  }

  if (!form.host.trim()) {
    toast.add({
      title: 'Host is required',
      color: 'error'
    })

    return
  }

  if (!props.item && !form.password.trim()) {
    toast.add({
      title: 'Password is required',
      color: 'error'
    })

    return
  }

  if (!form.assignedDatabases.trim()) {
    toast.add({
      title: 'Assigned database is required',
      color: 'error'
    })

    return
  }

  if (!form.privileges.length) {
    toast.add({
      title: 'Please select at least one privilege',
      color: 'error'
    })

    return
  }

  emit('submit', { ...form })

  open.value = false
}
</script>