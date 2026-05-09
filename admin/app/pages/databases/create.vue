<template>
  <div v-if="canCreate" class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">Create Database</h1>
        <p class="mt-1 text-sm text-muted">
          Create a new database with username and password for website or application hosting.
        </p>
      </div>

      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="soft"
        to="/databases"
      >
        Back to Databases
      </UButton>
    </div>

    <DatabaseCreate @submit="createDatabase" />
  </div>

  <UCard v-else>
    <div class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-lock" class="size-7" />
      </div>

      <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
      <p class="mt-1 text-sm text-muted">
        You do not have permission to create databases.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import DatabaseCreate from '~/components/databases/DatabaseCreateForm.vue'
import type { DatabaseCreateForm } from '~/types/database'

const toast = useToast()

/**
 * Replace with your real key:
 * moduleKey.CREATE_DB
 */
const CREATE_DB_MODULE_KEY = 'create_db'

const currentPermissions = ref([
  {
    module_key: CREATE_DB_MODULE_KEY,
    permission_name: 'create'
  }
])

function hasPermission(moduleKey: string, permissionName: string) {
  return currentPermissions.value.some(
    (item) =>
      item.module_key === moduleKey &&
      item.permission_name === permissionName
  )
}

const canCreate = computed(() => hasPermission(CREATE_DB_MODULE_KEY, 'create'))

async function createDatabase(form: DatabaseCreateForm) {
  if (!canCreate.value) return

  /**
   * Replace this with your API.
   *
   * await fetch.post('/databases', form)
   */

  toast.add({
    title: 'Database created',
    description: form.database_name,
    color: 'success'
  })

  await navigateTo('/databases')
}
</script>