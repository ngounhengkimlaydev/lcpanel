<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon name="i-lucide-receipt" class="size-5" />
            </div>

            <div>
              <h3 class="text-lg font-bold text-highlighted">Create Invoice</h3>
              <p class="text-sm text-muted">Create a new invoice for your customer.</p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="Customer" required>
            <UInput
              v-model="form.customer"
              icon="i-lucide-user"
              placeholder="Customer name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Amount" required>
            <UInput
              v-model="form.amount"
              icon="i-lucide-dollar-sign"
              placeholder="$15.00"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status">
            <USelect
              v-model="form.status"
              :items="statusItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Due Date" required>
            <UInput
              v-model="form.due_date"
              icon="i-lucide-calendar"
              type="date"
              class="w-full"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs text-muted">
              Invoice ID will be generated automatically.
            </p>

            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                @click="open = false"
              />

              <UButton
                label="Create Invoice"
                icon="i-lucide-save"
                @click="submit"
              />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Invoice } from '~/types'

const emit = defineEmits<{
  submit: [invoice: Invoice]
}>()

const open = defineModel<boolean>('open', { default: false })

const statusItems = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Draft', value: 'draft' }
]

const form = reactive<Invoice>({
  id: '',
  customer: '',
  amount: '',
  status: 'unpaid',
  due_date: ''
})

watch(open, (value) => {
  if (!value) return

  Object.assign(form, {
    id: '',
    customer: '',
    amount: '',
    status: 'unpaid',
    due_date: ''
  })
})

function submit() {
  emit('submit', {
    ...form,
    id: `INV-${Date.now()}`
  })
}
</script>