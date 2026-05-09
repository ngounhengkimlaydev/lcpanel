<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-highlighted">IP Block List</h2>
        <p class="text-sm text-muted">
          Showing {{ items.length }} of {{ total }} IP records.
        </p>
      </div>

      <UBadge color="neutral" variant="soft">
        Firewall Protection
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
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-xl"
              :class="getIconClass(item.status)"
            >
              <UIcon :name="getStatusIcon(item.status)" class="size-5" />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-highlighted">
                  {{ item.ip }}
                </h3>

                <UBadge :color="getStatusColor(item.status)" variant="soft">
                  {{ formatLabel(item.status) }}
                </UBadge>
              </div>

              <p class="mt-1 line-clamp-2 text-sm text-muted">
                {{ item.reason }}
              </p>

              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ item.country }}
                </UBadge>

                <UBadge :color="getScopeColor(item.scope)" variant="soft">
                  {{ formatLabel(item.scope) }}
                </UBadge>

                <UBadge :color="getTypeColor(item.type)" variant="outline">
                  {{ formatLabel(item.type) }}
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
            <p class="text-xs text-muted">Attempts</p>
            <p class="mt-1 font-semibold text-highlighted">
              {{ item.attempts }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">Blocked At</p>
            <p class="mt-1 text-sm text-highlighted">
              {{ formatDate(item.blockedAt) }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted">Expires</p>
            <p class="mt-1 text-sm text-highlighted">
              {{ item.expiresAt ? formatDate(item.expiresAt) : 'Never' }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-search-x" class="size-7" />
      </div>

      <h3 class="mt-4 font-semibold text-highlighted">No blocked IP found</h3>
      <p class="mt-1 text-sm text-muted">
        Try changing your search or filters.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  BlockedIp,
  BlockedIpScope,
  BlockedIpStatus,
  BlockedIpType
} from '~/types/blocked-ip'

const props = defineProps<{
  items: BlockedIp[]
  total: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  edit: [item: BlockedIp]
  unblock: [item: BlockedIp]
  delete: [item: BlockedIp]
  whitelist: [item: BlockedIp]
}>()

function getActions(item: BlockedIp) {
  const actions: any[][] = []

  if (props.canUpdate) {
    actions.push([
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        onSelect: () => emit('edit', item)
      },
      {
        label: 'Unblock',
        icon: 'i-lucide-unlock',
        disabled: item.status !== 'active',
        onSelect: () => emit('unblock', item)
      },
      {
        label: 'Whitelist',
        icon: 'i-lucide-shield-check',
        disabled: item.status === 'whitelisted',
        onSelect: () => emit('whitelist', item)
      }
    ])
  }

  if (props.canDelete) {
    actions.push([
      {
        label: 'Delete',
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

function getStatusColor(status: BlockedIpStatus) {
  const colors = {
    active: 'error',
    expired: 'neutral',
    whitelisted: 'success'
  } as const

  return colors[status]
}

function getTypeColor(type: BlockedIpType) {
  const colors = {
    manual: 'primary',
    auto: 'warning',
    firewall: 'error'
  } as const

  return colors[type]
}

function getScopeColor(scope: BlockedIpScope) {
  const colors = {
    global: 'error',
    ssh: 'warning',
    http: 'primary',
    mail: 'success',
    database: 'neutral'
  } as const

  return colors[scope]
}

function getStatusIcon(status: BlockedIpStatus) {
  const icons = {
    active: 'i-lucide-ban',
    expired: 'i-lucide-clock',
    whitelisted: 'i-lucide-shield-check'
  }

  return icons[status]
}

function getIconClass(status: BlockedIpStatus) {
  const classes = {
    active: 'bg-error/10 text-error',
    expired: 'bg-muted text-muted',
    whitelisted: 'bg-success/10 text-success'
  }

  return classes[status]
}
</script>