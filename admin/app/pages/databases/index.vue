<template>
  <div v-if="canView" class="space-y-6">
    <DatabaseHeader
      :can-create="canCreate"
      @refresh="refresh"
      @create="goToCreate"
    />

    <DatabaseStats :items="databases" />

    <DatabaseToolbar
      :search="search"
      :status="selectedStatus"
      :engine="selectedEngine"
      :status-options="statusFilterOptions"
      :engine-options="engineFilterOptions"
      @update:search="search = $event"
      @update:status="selectedStatus = $event"
      @update:engine="selectedEngine = $event"
    />

    <DatabaseList
      :items="filteredDatabases"
      :total="databases.length"
      :can-update="canUpdate"
      :can-delete="canDelete"
      @view="viewDatabase"
      @backup="backupDatabase"
      @delete="deleteDatabase"
    />
  </div>

  <UCard v-else>
    <div class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-lock" class="size-7" />
      </div>

      <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
      <p class="mt-1 text-sm text-muted">
        You do not have permission to view databases.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import DatabaseHeader from '~/components/databases/DatabaseHeader.vue'
import DatabaseList from '~/components/databases/DatabaseList.vue'
import DatabaseStats from '~/components/databases/DatabaseStats.vue'
import DatabaseToolbar from '~/components/databases/DatabaseToolbar.vue'
import type {
  DatabaseEngine,
  DatabaseItem,
  DatabaseStatus
} from '~/types/database'

const toast = useToast()

/**
 * Replace with your real module keys:
 * moduleKey.DATABASE
 * moduleKey.CREATE_DB
 */
const DATABASE_MODULE_KEY = 'database'
const CREATE_DB_MODULE_KEY = 'create_db'

const currentPermissions = ref([
  {
    module_key: DATABASE_MODULE_KEY,
    permission_name: 'view'
  },
  {
    module_key: DATABASE_MODULE_KEY,
    permission_name: 'update'
  },
  {
    module_key: DATABASE_MODULE_KEY,
    permission_name: 'delete'
  },
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

const canView = computed(() => hasPermission(DATABASE_MODULE_KEY, 'view'))
const canCreate = computed(() => hasPermission(CREATE_DB_MODULE_KEY, 'create'))
const canUpdate = computed(() => hasPermission(DATABASE_MODULE_KEY, 'update'))
const canDelete = computed(() => hasPermission(DATABASE_MODULE_KEY, 'delete'))

const search = ref('')
const selectedStatus = ref('all')
const selectedEngine = ref('all')

const databases = ref<DatabaseItem[]>([
  {
    id: 1,
    name: 'lcpanel_core',
    username: 'lcpanel_user',
    engine: 'mysql',
    size: '248 MB',
    tables: 36,
    status: 'active',
    host: 'localhost',
    createdAt: '2026-05-01T09:20',
    lastBackupAt: '2026-05-09T02:00'
  },
  {
    id: 2,
    name: 'client_shop_db',
    username: 'shop_user',
    engine: 'mysql',
    size: '86 MB',
    tables: 18,
    status: 'active',
    host: 'localhost',
    createdAt: '2026-05-03T14:40',
    lastBackupAt: '2026-05-08T02:00'
  },
  {
    id: 3,
    name: 'wordpress_demo',
    username: 'wp_demo',
    engine: 'mariadb',
    size: '512 MB',
    tables: 42,
    status: 'active',
    host: 'localhost',
    createdAt: '2026-05-04T11:15',
    lastBackupAt: null
  },
  {
    id: 4,
    name: 'old_project_db',
    username: 'old_user',
    engine: 'mysql',
    size: '31 MB',
    tables: 9,
    status: 'suspended',
    host: 'localhost',
    createdAt: '2026-04-20T08:05',
    lastBackupAt: '2026-04-29T02:00'
  },
  {
    id: 5,
    name: 'analytics_service',
    username: 'analytics_user',
    engine: 'postgresql',
    size: '1.2 GB',
    tables: 22,
    status: 'error',
    host: '127.0.0.1',
    createdAt: '2026-04-11T17:30',
    lastBackupAt: null
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
    label: 'Error',
    value: 'error'
  }
]

const engineFilterOptions = [
  {
    label: 'All Engines',
    value: 'all'
  },
  {
    label: 'MySQL',
    value: 'mysql'
  },
  {
    label: 'MariaDB',
    value: 'mariadb'
  },
  {
    label: 'PostgreSQL',
    value: 'postgresql'
  }
]

const filteredDatabases = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  return databases.value.filter((item) => {
    const matchSearch =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.username.toLowerCase().includes(keyword) ||
      item.host.toLowerCase().includes(keyword)

    const matchStatus =
      selectedStatus.value === 'all' ||
      item.status === selectedStatus.value as DatabaseStatus

    const matchEngine =
      selectedEngine.value === 'all' ||
      item.engine === selectedEngine.value as DatabaseEngine

    return matchSearch && matchStatus && matchEngine
  })
})

function refresh() {
  toast.add({
    title: 'Databases refreshed',
    color: 'success'
  })
}

function goToCreate() {
  if (!canCreate.value) return

  navigateTo('/databases/create')
}

function viewDatabase(item: DatabaseItem) {
  toast.add({
    title: 'Database selected',
    description: item.name,
    color: 'primary'
  })
}

function backupDatabase(item: DatabaseItem) {
  if (!canUpdate.value) return

  item.lastBackupAt = new Date().toISOString()

  toast.add({
    title: 'Backup started',
    description: item.name,
    color: 'success'
  })
}

function deleteDatabase(item: DatabaseItem) {
  if (!canDelete.value) return

  databases.value = databases.value.filter((database) => database.id !== item.id)

  toast.add({
    title: 'Database deleted',
    description: item.name,
    color: 'error'
  })
}
</script>