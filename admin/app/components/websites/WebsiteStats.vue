<template>
  <div class="grid gap-4 ">
    <UCard>
      <p class="text-sm text-muted">Total Websites</p>
      <p class="mt-2 text-2xl font-bold">{{ websites.length }}</p>
    </UCard>

    <UCard>
      <p class="text-sm text-muted">Active</p>
      <p class="mt-2 text-2xl font-bold text-success">{{ activeCount }}</p>
    </UCard>

    <UCard>
      <p class="text-sm text-muted">SSL Enabled</p>
      <p class="mt-2 text-2xl font-bold text-success">{{ sslCount }}</p>
    </UCard>

    <UCard>
      <p class="text-sm text-muted">Pending</p>
      <p class="mt-2 text-2xl font-bold text-warning">{{ pendingCount }}</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Website } from '~/types/website'

const props = defineProps<{
  websites: Website[]
}>()

const activeCount = computed(() => props.websites.filter((item) => item.status === 'active').length)
const sslCount = computed(() => props.websites.filter((item) => item.ssl).length)
const pendingCount = computed(() => props.websites.filter((item) => item.status === 'pending').length)
</script>