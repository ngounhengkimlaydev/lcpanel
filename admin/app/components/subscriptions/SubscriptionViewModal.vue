<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard v-if="subscription">
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">Subscription Details</h3>
        </template>

        <div class="space-y-3 text-sm">
          <p><b>Customer:</b> {{ subscription.customer }}</p>
          <p><b>Email:</b> {{ subscription.email }}</p>
          <p><b>Plan:</b> {{ subscription.plan }}</p>
          <p><b>Price:</b> {{ subscription.price }}</p>
          <p><b>Status:</b> {{ subscription.status }}</p>
          <p><b>Start Date:</b> {{ subscription.started_at }}</p>
          <p><b>Expiry Date:</b> {{ subscription.expired_at }}</p>
          <p><b>Websites:</b> {{ subscription.websites }}</p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton label="Close" color="neutral" variant="ghost" @click="open = false" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Subscription } from '~/types'

defineProps<{
  subscription: Subscription | null
}>()

const open = defineModel<boolean>('open', { default: false })
</script>