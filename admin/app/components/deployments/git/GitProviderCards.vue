<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <UCard
      v-for="provider in providers"
      :key="provider.key"
      class="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg"
      :ui="{ body: 'space-y-4' }"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UIcon :name="provider.icon" class="size-6" />
          </div>

          <div>
            <h3 class="font-semibold text-highlighted">
              {{ provider.name }}
            </h3>

            <p class="text-sm text-muted">
              {{ provider.description }}
            </p>
          </div>
        </div>

        <UBadge
          :color="provider.connected ? 'success' : 'neutral'"
          variant="soft"
        >
          {{ provider.connected ? "Connected" : "Not Connected" }}
        </UBadge>
      </div>

      <UButton
        block
        :icon="provider.connected ? 'i-lucide-link' : 'i-lucide-plug'"
        :color="provider.connected ? 'neutral' : 'primary'"
        :variant="provider.connected ? 'soft' : 'solid'"
        @click="$emit('connect', provider)"
      >
        {{ provider.connected ? "Manage Connection" : `Connect ${provider.name}` }}
      </UButton>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { GitProvider } from "~/types/git"

defineProps<{
  providers: GitProvider[]
}>()

defineEmits<{
  connect: [provider: GitProvider]
}>()
</script>