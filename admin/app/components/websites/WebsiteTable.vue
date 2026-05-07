<template>
  <UCard class="mt-5 space-y-4">
    <UTable :data="paginatedWebsites" :columns="columns" class="h-screen">
      <template #empty>
        <div class="py-12 text-center">
          <UIcon name="i-lucide-globe" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No websites found</p>
          <p class="text-sm text-muted">Try changing your filter or search.</p>
        </div>
      </template>
    </UTable>

    <div
      v-if="websites.length"
      class="flex items-center justify-between border-t border-default px-4 py-3"
    >
      <p class="text-sm text-muted">
        Showing {{ start + 1 }}-{{ end }} of {{ websites.length }}
      </p>

      <UPagination
        v-model:page="page"
        :total="websites.length"
        :items-per-page="pageSize"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Website } from '~/types/website'

const emit = defineEmits<{
  delete: [website: Website]
}>()

const props = defineProps<{
  websites: Website[]
}>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.websites.length))

const paginatedWebsites = computed(() => {
  return props.websites.slice(start.value, end.value)
})

watch(
  () => props.websites.length,
  () => {
    page.value = 1
  }
)

const columns: TableColumn<Website>[] = [
  {
    accessorKey: 'domain',
    header: 'Website',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', {
        class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'
      }, [
        h(resolveComponent('UIcon'), {
          name: 'i-lucide-globe',
          class: 'size-5'
        })
      ]),
      h('div', {}, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.domain),
        h('p', { class: 'text-sm text-muted' }, row.original.owner)
      ])
    ])
  },
  {
    accessorKey: 'ssl',
    header: 'SSL',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.ssl ? 'success' : 'neutral',
      variant: 'soft'
    }, {
      default: () => row.original.ssl ? 'Enabled' : 'Disabled'
    })
  },
  {
    accessorKey: 'php_version',
    header: 'PHP',
    cell: ({ row }) => `PHP ${row.original.php_version}`
  },
  { accessorKey: 'storage', header: 'Storage' },
  { accessorKey: 'bandwidth', header: 'Bandwidth' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status

      const colorMap: Record<string, string> = {
        active: 'success',
        suspended: 'error',
        pending: 'warning',
        error: 'error'
      }

      return h(resolveComponent('UBadge'), {
        color: colorMap[status] || 'neutral',
        variant: 'soft',
        class: 'capitalize'
      }, {
        default: () => status
      })
    }
  },
  { accessorKey: 'created_at', header: 'Created' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [
        [
          {
            label: 'Manage',
            icon: 'i-lucide-settings',
            to: `/websites/${row.original.id}`
          },
          {
            label: 'Open Website',
            icon: 'i-lucide-external-link'
          },
          {
            label: 'File Manager',
            icon: 'i-lucide-folder'
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