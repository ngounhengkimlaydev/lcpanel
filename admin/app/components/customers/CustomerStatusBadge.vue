<template>
  <UBadge :color="color" variant="soft" class="capitalize">
    {{ status }}
  </UBadge>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const color = computed(() => {
  if (props.status === 'active') return 'success'
  if (props.status === 'suspended') return 'error'
  if (props.status === 'inactive') return 'warning'

  return 'neutral'
})
</script>