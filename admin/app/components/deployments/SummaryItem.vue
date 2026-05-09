<template>
  <div>
    <p class="text-xs text-muted">{{ label }}</p>
    <p class="mt-1 truncate text-sm font-medium text-highlighted">
      {{ value || '-' }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>