<template>
  <div v-if="canView" class="space-y-6">
    <DatabaseUserHeader
      :can-create="canCreate"
      @create="openCreateModal"
      @refresh="refresh"
    />

    <DatabaseUserStats :items="databaseUsers" />

    <DatabaseUserToolbar
      :search="search"
      :status="selectedStatus"
      :auth-type="selectedAuthType"
      :status-options="statusFilterOptions"
      :auth-type-options="authTypeFilterOptions"
      @update:search="search = $event"
      @update:status="selectedStatus = $event"
      @update:auth-type="selectedAuthType = $event"
    />

    <DatabaseUserList
      :items="filteredDatabaseUsers"
      :total="databaseUsers.length"
      :can-update="canUpdate"
      :can-delete="canDelete"
      @edit="openEditModal"
      @reset-password="resetPassword"
      @suspend="suspendUser"
      @delete="deleteUser"
    />

    <DatabaseUserFormModal
      v-model:open="open"
      :item="editingItem"
      :status-options="statusOptions"
      :auth-type-options="authTypeOptions"
      :privilege-options="privilegeOptions"
      @submit="submitDatabaseUser"
    />
  </div>

  <UCard v-else>
    <div class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-lock" class="size-7" />
      </div>

      <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
      <p class="mt-1 text-sm text-muted">
        You do not have permission to view database users.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import DatabaseUserFormModal from '~/components/databases/users/DatabaseUserFormModal.vue'
import DatabaseUserHeader from '~/components/databases/users/DatabaseUserHeader.vue'
import DatabaseUserList from '~/components/databases/users/DatabaseUserList.vue'
import DatabaseUserStats from '~/components/databases/users/DatabaseUserStats.vue'
import DatabaseUserToolbar from '~/components/databases/users/DatabaseUserToolbar.vue'
import type {
  DatabasePrivilege,
  DatabaseUser,
  DatabaseUserAuthType,
  DatabaseUserForm,
  DatabaseUserStatus
} from '~/types/database-user'

const toast = useToast()

/**
 * Replace with:
 * moduleKey.DB_USERS
 */
const MODULE_KEY = 'db_users'

const currentPermissions = ref([
  {
    module_key: MODULE_KEY,
    permission_name: 'view'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'create'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'update'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'delete'
  }
])

function hasPermission(permissionName: string) {
  return currentPermissions.value.some(
    (item) =>
      item.module_key === MODULE_KEY &&
      item.permission_name === permissionName
  )
}

const canView = computed(() => hasPermission('view'))
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canDelete = computed(() => hasPermission('delete'))

const open = ref(false)
const search = ref('')
const selectedStatus = ref('all')
const selectedAuthType = ref('all')
const editingItem = ref<DatabaseUser | null>(null)

const databaseUsers = ref<DatabaseUser[]>([
  {
    id: 1,
    username: 'lcpanel_user',
    host: 'localhost',
    status: 'active',
    authType: 'password',
    assignedDatabases: ['lcpanel_core'],
    privileges: ['select', 'insert', 'update', 'delete', 'create', 'alter'],
    connections: 12,
    lastLoginAt: '2026-05-09T10:20',
    createdAt: '2026-05-01T09:20'
  },
  {
    id: 2,
    username: 'shop_user',
    host: 'localhost',
    status: 'active',
    authType: 'password',
    assignedDatabases: ['client_shop_db'],
    privileges: ['select', 'insert', 'update', 'delete'],
    connections: 4,
    lastLoginAt: '2026-05-09T08:45',
    createdAt: '2026-05-03T14:40'
  },
  {
    id: 3,
    username: 'wp_demo',
    host: 'localhost',
    status: 'active',
    authType: 'password',
    assignedDatabases: ['wordpress_demo'],
    privileges: ['select', 'insert', 'update', 'delete', 'create', 'drop', 'index', 'alter'],
    connections: 8,
    lastLoginAt: '2026-05-08T16:10',
    createdAt: '2026-05-04T11:15'
  },
  {
    id: 4,
    username: 'backup_reader',
    host: '127.0.0.1',
    status: 'locked',
    authType: 'socket',
    assignedDatabases: ['lcpanel_core', 'client_shop_db'],
    privileges: ['select'],
    connections: 0,
    lastLoginAt: null,
    createdAt: '2026-04-25T13:30'
  },
  {
    id: 5,
    username: 'remote_report',
    host: '%',
    status: 'suspended',
    authType: 'remote',
    assignedDatabases: ['analytics_service'],
    privileges: ['select', 'insert'],
    connections: 1,
    lastLoginAt: '2026-05-05T18:00',
    createdAt: '2026-04-18T07:50'
  }
])

const statusFilterOptions = [
  {
    label: 'All Status',
    value: 'all'
  },
  {
    label: 'Active',
    value: 'active'
  },
  {
    label: 'Suspended',
    value: 'suspended'
  },
  {
    label: 'Locked',
    value: 'locked'
  }
]

const authTypeFilterOptions = [
  {
    label: 'All Auth Types',
    value: 'all'
  },
  {
    label: 'Password',
    value: 'password'
  },
  {
    label: 'Socket',
    value: 'socket'
  },
  {
    label: 'Remote',
    value: 'remote'
  }
]

const statusOptions = statusFilterOptions.filter((item) => item.value !== 'all')
const authTypeOptions = authTypeFilterOptions.filter((item) => item.value !== 'all')

const privilegeOptions: { label: string; value: DatabasePrivilege }[] = [
  {
    label: 'Select',
    value: 'select'
  },
  {
    label: 'Insert',
    value: 'insert'
  },
  {
    label: 'Update',
    value: 'update'
  },
  {
    label: 'Delete',
    value: 'delete'
  },
  {
    label: 'Create',
    value: 'create'
  },
  {
    label: 'Drop',
    value: 'drop'
  },
  {
    label: 'Index',
    value: 'index'
  },
  {
    label: 'Alter',
    value: 'alter'
  }
]

const filteredDatabaseUsers = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  return databaseUsers.value.filter((item) => {
    const matchSearch =
      !keyword ||
      item.username.toLowerCase().includes(keyword) ||
      item.host.toLowerCase().includes(keyword) ||
      item.assignedDatabases.some((database) =>
        database.toLowerCase().includes(keyword)
      )

    const matchStatus =
      selectedStatus.value === 'all' ||
      item.status === selectedStatus.value as DatabaseUserStatus

    const matchAuthType =
      selectedAuthType.value === 'all' ||
      item.authType === selectedAuthType.value as DatabaseUserAuthType

    return matchSearch && matchStatus && matchAuthType
  })
})

function refresh() {
  toast.add({
    title: 'Database users refreshed',
    color: 'success'
  })
}

function openCreateModal() {
  if (!canCreate.value) return

  editingItem.value = null
  open.value = true
}

function openEditModal(item: DatabaseUser) {
  if (!canUpdate.value) return

  editingItem.value = item
  open.value = true
}

function submitDatabaseUser(form: DatabaseUserForm) {
  if (editingItem.value) {
    if (!canUpdate.value) return

    Object.assign(editingItem.value, {
      username: form.username,
      host: form.host,
      status: form.status,
      authType: form.authType,
      assignedDatabases: parseAssignedDatabases(form.assignedDatabases),
      privileges: form.privileges
    })

    toast.add({
      title: 'Database user updated',
      description: form.username,
      color: 'success'
    })

    return
  }

  if (!canCreate.value) return

  databaseUsers.value.unshift({
    id: Date.now(),
    username: form.username,
    host: form.host,
    status: form.status,
    authType: form.authType,
    assignedDatabases: parseAssignedDatabases(form.assignedDatabases),
    privileges: form.privileges,
    connections: 0,
    lastLoginAt: null,
    createdAt: new Date().toISOString()
  })

  toast.add({
    title: 'Database user created',
    description: form.username,
    color: 'success'
  })
}

function resetPassword(item: DatabaseUser) {
  if (!canUpdate.value) return

  toast.add({
    title: 'Password reset',
    description: item.username,
    color: 'success'
  })
}

function suspendUser(item: DatabaseUser) {
  if (!canUpdate.value) return

  item.status = item.status === 'suspended' ? 'active' : 'suspended'

  toast.add({
    title: item.status === 'suspended' ? 'User suspended' : 'User activated',
    description: item.username,
    color: item.status === 'suspended' ? 'warning' : 'success'
  })
}

function deleteUser(item: DatabaseUser) {
  if (!canDelete.value) return

  databaseUsers.value = databaseUsers.value.filter((user) => user.id !== item.id)

  toast.add({
    title: 'Database user deleted',
    description: item.username,
    color: 'error'
  })
}

function parseAssignedDatabases(value: string) {
  return value
    .split(',')
    .map((database) => database.trim())
    .filter(Boolean)
}
</script>