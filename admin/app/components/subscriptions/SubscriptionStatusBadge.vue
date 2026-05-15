<template>
  <UBadge :color="color" variant="soft" class="capitalize">
    {{ label }}
  </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string | number
  statusKey?: string
  statusLabel?: string
}>()

const resolvedKey = computed(() => {
  if (props.statusKey) return props.statusKey
  if (props.status === 1) return 'active'
  if (props.status === 2) return 'disabled'
  if (props.status === 3) return 'overdue'
  return String(props.status).toLowerCase()
})

const color = computed(() => {
  if (resolvedKey.value === 'active') return 'success'
  if (resolvedKey.value === 'expired') return 'warning'
  if (resolvedKey.value === 'disabled') return 'error'
  if (resolvedKey.value === 'overdue') return 'error'
  return 'info'
})

const label = computed(() => {
  if (props.statusLabel) return props.statusLabel
  return resolvedKey.value.replaceAll('_', ' ')
})
</script>
