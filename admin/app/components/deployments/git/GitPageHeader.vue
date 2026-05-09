<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        Git Repository
      </h1>

      <p class="mt-1 text-sm text-muted">
        Connect GitHub or GitLab and import your project for deployment.
      </p>
    </div>

    <UButton
      icon="i-lucide-refresh-cw"
      color="neutral"
      variant="soft"
      @click="$emit('refresh')"
    >
      Refresh
    </UButton>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  refresh: []
}>()
</script>