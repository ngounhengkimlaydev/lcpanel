<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard v-if="subscription">
        <template #header>
          <h3 class="text-lg font-bold text-highlighted">Subscription Details</h3>
        </template>

        <div class="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div class="space-y-3">
            <p><b>Customer:</b> {{ subscription.customer }}</p>
            <p><b>Email:</b> {{ subscription.email ?? '-' }}</p>
            <p><b>Phone:</b> {{ subscription.customer_details?.phone ?? subscription.phone ?? '-' }}</p>
            <p><b>Status:</b> {{ subscription.status_label ?? subscription.status_key ?? subscription.status }}</p>
            <p><b>Start Date:</b> {{ subscription.started_at }}</p>
            <p><b>Expiry Date:</b> {{ subscription.expired_at }}</p>
          </div>

          <div class="space-y-3">
            <p><b>Plan:</b> {{ subscription.plan }}</p>
            <p><b>Price:</b> {{ subscription.price_formatted ?? subscription.price }}</p>
            <p><b>Websites:</b> {{ subscription.websites }}</p>
            <p><b>Storage:</b> {{ subscription.storage ?? subscription.plan_details?.storage ?? 0 }} MB</p>
            <p><b>Bandwidth:</b> {{ subscription.plan_details?.bandwidth ?? 0 }} GB</p>
            <p><b>Database:</b> {{ subscription.plan_details?.database ?? 0 }}</p>
          </div>
        </div>

        <div v-if="subscription.invoices?.length" class="mt-6 border-t border-default pt-4">
          <h4 class="mb-3 font-semibold text-highlighted">Recent Invoices</h4>
          <div class="space-y-2">
            <div v-for="invoice in subscription.invoices" :key="invoice.id" class="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <div>
                <p class="font-medium text-highlighted">{{ invoice.code }}</p>
                <p class="text-xs text-muted">Due {{ invoice.due_date }}</p>
              </div>
              <UBadge variant="soft">{{ getInvoiceStatusLabel(invoice.status) }}</UBadge>
            </div>
          </div>
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

function getInvoiceStatusLabel(status: number | string) {
  if (status === 1 || status === 'paid') return 'Paid'
  if (status === 2 || status === 'unpaid') return 'Unpaid'
  if (status === 3 || status === 'overdue') return 'Overdue'
  return String(status)
}
</script>
