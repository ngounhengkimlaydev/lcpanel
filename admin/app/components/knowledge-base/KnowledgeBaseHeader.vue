<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">Knowledge Base</h1>
      <p class="mt-1 text-sm text-muted">
        Manage LCPANEL documentation, guides, troubleshooting notes, and customer help articles.
      </p>
    </div>

    <div class="flex gap-2">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        @click="emit('refresh')"
      >
        Refresh
      </UButton>

      <UButton
        v-if="canCreate"
        icon="i-lucide-plus"
        @click="emit('create')"
      >
        New Article
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  canCreate: boolean
}>()

const emit = defineEmits<{
  create: []
  refresh: []
}>()
</script>