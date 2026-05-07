<template>
  <UTable :data="apps" :columns="columns">
    <template #status-cell="{ row }">
      <UBadge :color="getStatusColor(row.original.status)" variant="soft">
        {{ row.original.status }}
      </UBadge>
    </template>

    <template #actions-cell="{ row }">
      <UDropdownMenu :items="getActions(row.original)">
        <UButton
          icon="i-lucide-more-horizontal"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
    </template>
  </UTable>
</template>

<script setup lang="ts">
defineProps<{
  apps: any[]
}>()

const emit = defineEmits<{
  edit: [app: any]
  restart: [app: any]
  stop: [app: any]
  logs: [app: any]
}>()

const columns = [
  { accessorKey: 'name', header: 'App Name' },
  { accessorKey: 'domain', header: 'Domain' },
  { accessorKey: 'path', header: 'App Path' },
  { accessorKey: 'startup', header: 'Startup File' },
  { accessorKey: 'runtime', header: 'Runtime' },
  { accessorKey: 'port', header: 'Port' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'actions', header: '' }
]

const getStatusColor = (status: string) => {
  if (status === 'running') return 'success'
  if (status === 'stopped') return 'neutral'
  if (status === 'error') return 'error'
  return 'warning'
}

const getActions = (app: any) => [
  [
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', app)
    },
    {
      label: 'Restart',
      icon: 'i-lucide-refresh-cw',
      onSelect: () => emit('restart', app)
    },
    {
      label: 'Stop',
      icon: 'i-lucide-square',
      onSelect: () => emit('stop', app)
    },
    {
      label: 'View Logs',
      icon: 'i-lucide-file-text',
      onSelect: () => emit('logs', app)
    }
  ]
]
</script>