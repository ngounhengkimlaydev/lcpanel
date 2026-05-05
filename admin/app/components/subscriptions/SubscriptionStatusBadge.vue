<template>
  <UBadge :color="color" variant="soft" class="capitalize">
    {{ label }}
  </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const color = computed(() => {
  if (props.status === 'active') return 'success'
  if (props.status === 'past_due') return 'warning'
  if (props.status === 'cancelled') return 'error'
  if (props.status === 'expired') return 'neutral'
  return 'info'
})

const label = computed(() => props.status.replaceAll('_', ' '))
</script>