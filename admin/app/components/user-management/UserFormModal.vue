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
                {{
                  type === 'create'
                    ? 'Add a new admin user.'
                    : 'Update admin user information.'
                }}
              </p>
            </div>
          </div>
        </template>

        <UForm :schema="schema" :state="form" class="space-y-4" @submit="submit">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <UFormField label="Full Name" name="full_name" required>
              <UInput v-model="form.full_name" icon="i-lucide-user" class="w-full" />
            </UFormField>

            <UFormField label="Username" name="username" required>
              <UInput v-model="form.username" icon="i-lucide-at-sign" class="w-full" />
            </UFormField>

            <UFormField label="Email" name="email">
              <UInput v-model="form.email" icon="i-lucide-mail" class="w-full" />
            </UFormField>

            <UFormField label="Password" name="password" :required="type === 'create'">
              <UInput v-model="form.password" type="password" icon="i-lucide-lock" class="w-full" />
            </UFormField>

            <UFormField label="Confirm Password" name="password_confirmation" :required="type === 'create'">
              <UInput v-model="form.password_confirmation" type="password" icon="i-lucide-lock-keyhole"
                class="w-full" />
            </UFormField>

            <UFormField label="Role" name="role_id" required>
              <USelectMenu v-model="selectedRole" :items="roles" searchable class="w-full" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />

            <UButton type="submit" :label="type === 'create' ? 'Create User' : 'Save Changes'" icon="i-lucide-save" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AdminUser, RoleOption } from '~/types/admin'
import { UserStatus } from '~/types/admin'

const props = defineProps<{
  type: 'create' | 'edit'
  user: AdminUser | null
}>()

const emit = defineEmits<{
  submit: [user: AdminUser]
}>()

const open = defineModel<boolean>('open', {
  default: false
})

const userStore = useUserStore()

const roles = computed<RoleOption[]>(() =>
  userStore.roles.map((item: any) => ({
    label: item.role_name,
    value: item.id,
    user_type_id: item.user_type_id
  }))
)

const selectedRole = ref<RoleOption | null>(null)

const form = reactive<AdminUser>({
  id: 0,
  full_name: '',
  username: '',
  email: null,
  password: '',
  password_confirmation: '',
  role_id: null,
  user_type_id: null,
  status: UserStatus.ACTIVE,
  last_login: '-',
  created_at: ''
})

const schema = computed(() => {
  return z
    .object({
      full_name: z
        .string()
        .min(1, 'Full name is required'),

      username: z
        .string()
        .min(1, 'Username is required'),

      email: z
        .string()
        .email('Invalid email')
        .optional()
        .or(z.literal('')),

      password:
        props.type === 'create'
          ? z
            .string()
            .min(6, 'Password must be at least 6 characters')
          : z
            .string()
            .optional()
            .or(z.literal('')),

      password_confirmation:
        props.type === 'create'
          ? z
            .string()
            .min(1, 'Confirm password is required')
          : z
            .string()
            .optional()
            .or(z.literal('')),

      role_id: z.number({
        message: 'Role is required'
      }),

      user_type_id: z.number({
        message: 'User type is required'
      }),

      status: z.number()
    })
    .refine(
      (data) => data.password === data.password_confirmation,
      {
        message: 'Password confirmation does not match',
        path: ['password_confirmation']
      }
    )
})

watch(selectedRole, (role) => {
  form.role_id = role?.value ?? null
  form.user_type_id = role?.user_type_id ?? null
})

function resetForm() {
  Object.assign(form, {
    id: 0,
    full_name: '',
    username: '',
    email: null,
    password: '',
    password_confirmation: '',
    role_id: null,
    user_type_id: null,
    status: UserStatus.ACTIVE,
    last_login: '-',
    created_at: ''
  })
}

watch(open, async (value) => {
  if (!value) return

  if (!userStore.roles.length || !userStore.userTypes.length) {
    await userStore.initStore()
  }

  if (props.type === 'edit' && props.user) {
    Object.assign(form, {
      ...props.user,
      password: '',
      password_confirmation: ''
    })

    selectedRole.value =
      roles.value.find(
        (role) => role.value === props.user?.role_id
      ) || null
  } else {
    resetForm()

    selectedRole.value = roles.value[0] || null
  }
})

function submit(event: FormSubmitEvent<AdminUser>) {
  emit('submit', {
    ...event.data
  })
}
</script>