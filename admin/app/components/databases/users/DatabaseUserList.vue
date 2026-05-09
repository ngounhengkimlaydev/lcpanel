<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-highlighted">User List</h2>
        <p class="text-sm text-muted">
          Showing {{ items.length }} of {{ total }} database users.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        MySQL Access Control
      </UBadge>
    </div>

    <div v-if="items.length" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="item in items"
        :key="item.id"
        class="transition hover:border-primary/40"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon name="i-lucide-user-round-cog" class="size-5" />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-highlighted">
                  {{ item.username }}
                </h3>

                <UBadge :color="getStatusColor(item.status)" variant="soft">
                  {{ formatLabel(item.status) }}
                </UBadge>
              </div>

              <p class="mt-1 text-sm text-muted">
                Host:
                <span class="font-medium text-highlighted">{{ item.host }}</span>
              </p>

              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ formatLabel(item.authType) }}
                </UBadge>

                <UBadge color="primary" variant="outline">
                  {{ item.assignedDatabases.length }} Database
                </UBadge>

                <UBadge color="neutral" variant="outline">
                  {{ item.privileges.length }} Privileges
                </UBadge>
              </div>
            </div>
          </div>

          <UDropdownMenu :items="getActions(item)">
            <UButton
              icon="i-lucide-more-horizontal"
              color="neutral"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>

        <div class="mt-4 space-y-3 border-t border-default pt-4">
          <div>
            <p class="text-xs text-muted">Assigned Databases</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <UBadge
                v-for="database in item.assignedDatabases"
                :key="database"
                color="neutral"
                variant="soft"
                size="sm"
              >
                {{ database }}
              </UBadge>
            </div>
          </div>

          <div>
            <p class="text-xs text-muted">Privileges</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <UBadge
                v-for="privilege in item.privileges"
                :key="privilege"
                color="primary"
                variant="soft"
                size="sm"
              >
                {{ formatLabel(privilege) }}
              </UBadge>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 border-t border-default pt-4 sm:grid-cols-3">
            <div>
              <p class="text-xs text-muted">Connections</p>
              <p class="mt-1 font-semibold text-highlighted">
                {{ item.connections }}
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">Last Login</p>
              <p class="mt-1 text-sm text-highlighted">
                {{ item.lastLoginAt ? formatDate(item.lastLoginAt) : 'Never' }}
              </p>
            </div>

            <div>
              <p class="text-xs text-muted">Created</p>
              <p class="mt-1 text-sm text-highlighted">
                {{ formatDate(item.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-user-search" class="size-7" />
      </div>

      <h3 class="mt-4 font-semibold text-highlighted">No database user found</h3>
      <p class="mt-1 text-sm text-muted">
        Try changing your search or filters.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  DatabaseUser,
  DatabaseUserStatus
} from '~/types/database-user'

const props = defineProps<{
  items: DatabaseUser[]
  total: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  edit: [item: DatabaseUser]
  'reset-password': [item: DatabaseUser]
  suspend: [item: DatabaseUser]
  delete: [item: DatabaseUser]
}>()

function getActions(item: DatabaseUser) {
  const actions: any[][] = []

  if (props.canUpdate) {
    actions.push([
      {
        label: 'Edit User',
        icon: 'i-lucide-pencil',
        onSelect: () => emit('edit', item)
      },
      {
        label: 'Reset Password',
        icon: 'i-lucide-key-round',
        onSelect: () => emit('reset-password', item)
      },
      {
        label: item.status === 'suspended' ? 'Activate User' : 'Suspend User',
        icon: item.status === 'suspended' ? 'i-lucide-user-check' : 'i-lucide-user-x',
        onSelect: () => emit('suspend', item)
      }
    ])
  }

  if (props.canDelete) {
    actions.push([
      {
        label: 'Delete User',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onSelect: () => emit('delete', item)
      }
    ])
  }

  return actions
}

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function getStatusColor(status: DatabaseUserStatus) {
  const colors = {
    active: 'success',
    suspended: 'warning',
    locked: 'error'
  } as const

  return colors[status]
}
</script>