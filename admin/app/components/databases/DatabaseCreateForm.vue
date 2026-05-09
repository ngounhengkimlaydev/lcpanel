<template>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
    <UCard class="xl:col-span-2">
      <template #header>
        <div>
          <h2 class="text-lg font-bold text-highlighted">Database Information</h2>
          <p class="text-sm text-muted">
            Enter database name, username, and password.
          </p>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Database Name" required>
          <UInput
            v-model="form.database_name"
            placeholder="example_app_db"
            icon="i-lucide-database"
          />
        </UFormField>

        <UFormField label="Username" required>
          <UInput
            v-model="form.username"
            placeholder="example_user"
            icon="i-lucide-user"
          />
        </UFormField>

        <UFormField label="Password" required class="md:col-span-2">
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter strong database password"
            icon="i-lucide-key-round"
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
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            to="/databases"
          >
            Cancel
          </UButton>

          <UButton
            icon="i-lucide-save"
            @click="submit"
          >
            Create Database
          </UButton>
        </div>
      </template>
    </UCard>

    <UCard :ui="{ body: 'space-y-4' }">
      <div class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UIcon name="i-lucide-shield-check" class="size-6" />
      </div>

      <div>
        <h3 class="font-bold text-highlighted">Database Security Tips</h3>
        <p class="mt-1 text-sm text-muted">
          Use a unique database username and strong password for every website or application.
        </p>
      </div>

      <div class="space-y-3 text-sm">
        <div class="flex gap-2">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 text-success" />
          <p class="text-muted">Use lowercase letters, numbers, and underscore for database name.</p>
        </div>

        <div class="flex gap-2">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 text-success" />
          <p class="text-muted">Do not reuse the same password for many databases.</p>
        </div>

        <div class="flex gap-2">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 text-success" />
          <p class="text-muted">Backup your database before changing application settings.</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { DatabaseCreateForm } from '~/types/database'

const emit = defineEmits<{
  submit: [form: DatabaseCreateForm]
}>()

const toast = useToast()
const showPassword = ref(false)

const form = reactive<DatabaseCreateForm>({
  database_name: '',
  username: '',
  password: ''
})

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'

  form.password = Array.from({ length: 18 }, () => {
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
}

function submit() {
  if (!form.database_name.trim()) {
    toast.add({
      title: 'Database name is required',
      color: 'error'
    })

    return
  }

  if (!form.username.trim()) {
    toast.add({
      title: 'Username is required',
      color: 'error'
    })

    return
  }

  if (!form.password.trim()) {
    toast.add({
      title: 'Password is required',
      color: 'error'
    })

    return
  }

  emit('submit', { ...form })
}
</script>