<template>
  <UCard class="mt-5 space-y-4">
    <UTable :data="paginatedDomains" :columns="columns" class="h-screen">
      <template #empty>
        <div class="py-12 text-center">
          <UIcon name="i-lucide-globe" class="mx-auto mb-3 size-10 text-muted" />
          <p class="font-medium text-highlighted">No domains found</p>
          <p class="text-sm text-muted">Try changing your filter or search.</p>
        </div>
      </template>
    </UTable>

    <div v-if="domains.length" class="flex items-center justify-between border-t border-default px-4 py-3">
      <p class="text-sm text-muted">Showing {{ start + 1 }}-{{ end }} of {{ domains.length }}</p>
      <UPagination v-model:page="page" :total="domains.length" :items-per-page="pageSize" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { DomainItem } from '~/types/website';

const emit = defineEmits<{
  edit: [domain: DomainItem]
  delete: [domain: DomainItem]
}>()

const props = defineProps<{ domains: DomainItem[] }>()

const page = ref(1)
const pageSize = ref(10)

const start = computed(() => (page.value - 1) * pageSize.value)
const end = computed(() => Math.min(start.value + pageSize.value, props.domains.length))
const paginatedDomains = computed(() => props.domains.slice(start.value, end.value))

watch(() => props.domains.length, () => page.value = 1)

const columns: TableColumn<DomainItem>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary' }, [
        h(resolveComponent('UIcon'), { name: 'i-lucide-globe', class: 'size-5' })
      ]),
      h('div', {}, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.domain),
        h('p', { class: 'text-sm text-muted' }, row.original.website)
      ])
    ])
  },
  {
    accessorKey: 'ssl',
    header: 'SSL',
    cell: ({ row }) => h(resolveComponent('UBadge'), {
      color: row.original.ssl ? 'success' : 'neutral',
      variant: 'soft'
    }, { default: () => row.original.ssl ? 'Enabled' : 'Disabled' })
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const colorMap: Record<string, string> = {
        active: 'success',
        disabled: 'neutral',
        pending: 'warning'
      }

      return h(resolveComponent('UBadge'), {
        color: colorMap[row.original.status] || 'neutral',
        variant: 'soft',
        class: 'capitalize'
      }, { default: () => row.original.status })
    }
  },
  { accessorKey: 'created_at', header: 'Created' },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const items: DropdownMenuItem[][] = [[
        { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit', row.original) },
        { label: 'Delete', icon: 'i-lucide-trash', color: 'error', onSelect: () => emit('delete', row.original) }
      ]]

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