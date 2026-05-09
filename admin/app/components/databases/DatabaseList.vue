<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-highlighted">Database List</h2>
        <p class="text-sm text-muted">
          Showing {{ items.length }} of {{ total }} databases.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        Local Database Server
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
              <UIcon name="i-lucide-database" class="size-5" />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-highlighted">
                  {{ item.name }}
                </h3>

                <UBadge :color="getStatusColor(item.status)" variant="soft">
                  {{ formatLabel(item.status) }}
                </UBadge>
              </div>

              <p class="mt-1 text-sm text-muted">
                User:
                <span class="font-medium text-highlighted">{{ item.username }}</span>
              </p>

              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ formatLabel(item.engine) }}
                </UBadge>

                <UBadge color="neutral" variant="soft">
                  {{ item.host }}
                </UBadge>

                <UBadge color="primary" variant="outline">
                  {{ item.size }}
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

        <div class="mt-4 grid grid-cols-1 gap-3 border-t border-default pt-4 sm:grid-cols-3">
          <div>
            <p class="text-xs text-muted">Tables</p>
            <p class="mt-1 font-semibold text-highlighted">
              {{ item.tables }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">Created</p>
            <p class="mt-1 text-sm text-highlighted">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">Last Backup</p>
            <p class="mt-1 text-sm text-highlighted">
              {{ item.lastBackupAt ? formatDate(item.lastBackupAt) : 'No backup' }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-database-zap" class="size-7" />
      </div>

      <h3 class="mt-4 font-semibold text-highlighted">No database found</h3>
      <p class="mt-1 text-sm text-muted">
        Try changing your search or filters.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  DatabaseItem,
  DatabaseStatus
} from '~/types/database'

const props = defineProps<{
  items: DatabaseItem[]
  total: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  view: [item: DatabaseItem]
  backup: [item: DatabaseItem]
  delete: [item: DatabaseItem]
}>()

function getActions(item: DatabaseItem) {
  const actions: any[][] = [
    [
      {
        label: 'View Details',
        icon: 'i-lucide-eye',
        onSelect: () => emit('view', item)
      }
    ]
  ]

  if (props.canUpdate) {
    actions.push([
      {
        label: 'Create Backup',
        icon: 'i-lucide-database-backup',
        onSelect: () => emit('backup', item)
      }
    ])
  }

  if (props.canDelete) {
    actions.push([
      {
        label: 'Delete Database',
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

function getStatusColor(status: DatabaseStatus) {
  const colors = {
    active: 'success',
    suspended: 'warning',
    error: 'error'
  } as const

  return colors[status]
}
</script>