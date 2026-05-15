<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard v-if="invoice">
        <template #header>
          <h3 class="text-lg font-bold">Invoice Details</h3>
        </template>

        <div class="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div class="space-y-2">
            <p><b>Invoice Code:</b> {{ invoice.code ?? invoice.id }}</p>
            <p><b>Customer:</b> {{ invoice.customer }}</p>
            <p><b>Email:</b> {{ invoice.customer_email ?? invoice.customer_details?.email ?? '-' }}</p>
            <p><b>Phone:</b> {{ invoice.customer_phone ?? invoice.customer_details?.phone ?? '-' }}</p>
            <p><b>Status:</b> {{ invoice.status_label ?? invoice.status_key ?? invoice.status }}</p>
          </div>

          <div class="space-y-2">
            <p><b>Amount:</b> {{ invoice.amount_formatted ?? invoice.amount }}</p>
            <p><b>Due:</b> {{ invoice.due_date }}</p>
            <p><b>Issued At:</b> {{ invoice.created_at ?? '-' }}</p>
            <p><b>Subscription Start:</b> {{ invoice.subscription?.started_at ?? '-' }}</p>
            <p><b>Subscription End:</b> {{ invoice.subscription?.expired_at ?? '-' }}</p>
          </div>
        </div>

        <div v-if="invoice.plan_details" class="mt-6 border-t border-default pt-4 text-sm">
          <h4 class="mb-3 font-semibold text-highlighted">Plan Details</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <p><b>Plan:</b> {{ invoice.plan_details.name }}</p>
            <p><b>Price:</b> {{ invoice.plan_details.price_formatted ?? invoice.plan_details.price }}</p>
            <p><b>Websites:</b> {{ invoice.plan_details.websites }}</p>
            <p><b>Storage:</b> {{ invoice.plan_details.storage }} MB</p>
            <p><b>Bandwidth:</b> {{ invoice.plan_details.bandwidth }} GB</p>
            <p><b>Database:</b> {{ invoice.plan_details.database }}</p>
            <p><b>Domain:</b> {{ invoice.plan_details.domain }}</p>
            <p><b>SSL:</b> {{ invoice.plan_details.ssl ? 'Included' : 'No' }}</p>
          </div>
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
