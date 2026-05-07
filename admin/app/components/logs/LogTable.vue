<template>
  <UCard class="mt-5 space-y-4">
    <UTable :data="paginatedLogs" :columns="columns" class="h-screen">
      <template #empty>
        <div class="py-12 text-center">
          <UIcon name="i-lucide-file-text" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No logs found</p>
          <p class="text-sm text-muted">Try changing your filter or search.</p>
        </div>
      </template>
    </UTable>

    <div
      v-if="logs.length"
      class="flex items-center justify-between border-t border-default px-4 py-3"
    >
      <p class="text-sm text-muted">
        Showing {{ start + 1 }}-{{ end }} of {{ logs.length }}
      </p>

      <UPagination
        v-model:page="page"
        :total="logs.length"
        :items-per-page="pageSize"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { ServerLog } from '~/types/log'

const emit = defineEmits<{
  delete: [log: ServerLog]
}>()

const props = defineProps<{
  logs: ServerLog[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.logs.length))

const paginatedLogs = computed(() => {
  return props.logs.slice(start.value, end.value)
})

watch(
  () => props.logs.length,
  () => {
    page.value = 1
  }
)

const columns: TableColumn<ServerLog>[] = [
  {
    accessorKey: 'message',
    header: 'Log',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', {
        class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'
      }, [
        h(resolveComponent('UIcon'), {
          name: 'i-lucide-file-text',
          class: 'size-5'
        })
      ]),
      h('div', {}, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.message),
        h('p', { class: 'text-sm text-muted' }, row.original.source)
      ])
    ])
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const level = row.original.level

      const colorMap: Record<string, string> = {
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'error'
      }

      return h(resolveComponent('UBadge'), {
        color: colorMap[level] || 'neutral',
        variant: 'soft',
        class: 'capitalize'
      }, {
        default: () => level
      })
    }
  },
  { accessorKey: 'ip', header: 'IP Address' },
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'created_at', header: 'Date' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [
        [
          {
            label: 'Copy Message',
            icon: 'i-lucide-copy',
            onSelect: () => navigator.clipboard.writeText(row.original.message)
          },
          {
            label: 'Delete',
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => emit('delete', row.original)
          }
        ]
      ]

      return h(resolveComponent('UDropdownMenu'), { items }, {
        default: () => h(resolveComponent('UButton'), {
          icon: 'i-lucide-ellipsis',
          color: 'neutral',
          variant: 'ghost'
        })
      })
    }
  }
]
</script>