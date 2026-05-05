<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard v-if="invoice">
        <template #header>
          <h3 class="text-lg font-bold">Invoice Details</h3>
        </template>

        <div class="space-y-2 text-sm">
          <p><b>ID:</b> {{ invoice.id }}</p>
          <p><b>Customer:</b> {{ invoice.customer }}</p>
          <p><b>Amount:</b> {{ invoice.amount }}</p>
          <p><b>Status:</b> {{ invoice.status }}</p>
          <p><b>Due:</b> {{ invoice.due_date }}</p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton label="Close" @click="open = false" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Invoice } from '~/types'

defineProps<{
  invoice: Invoice | null
}>()

const open = defineModel<boolean>('open')
</script>