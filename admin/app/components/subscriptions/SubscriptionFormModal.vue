<template>
    <UModal v-model:open="open">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-bold text-highlighted">Create Subscription</h3>
                </template>

                <div class="space-y-4">
                    <UFormField label="Customer" required>
                        <USelectMenu v-model="selectedCustomer" :items="customerItems" searchable
                            placeholder="Select customer" class="w-full" />
                    </UFormField>

                    <UFormField label="Plan" required>
                        <USelect v-model="form.plan" :items="plans" class="w-full" />
                    </UFormField>

                    <UFormField label="Websites">
                        <UInput v-model.number="form.websites" type="number" class="w-full" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
                        <UButton label="Create Subscription" icon="i-lucide-save" @click="submit" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { Subscription } from '~/types'

const emit = defineEmits<{
    submit: [subscription: Subscription]
}>()

const open = defineModel<boolean>('open', { default: false })

const plans = ['Basic', 'Business', 'Enterprise']

type CustomerOption = {
    label: string
    value: string
    email: string
}

const selectedCustomer = ref<CustomerOption | undefined>()

const customerItems: CustomerOption[] = [
    { label: 'LTech Digital', value: 'LTech Digital', email: 'admin@ltech.digital' },
    { label: 'Nexora Client', value: 'Nexora Client', email: 'client@nexora.com' },
    { label: 'Khmer Cloud', value: 'Khmer Cloud', email: 'billing@khmercloud.com' }
]

watch(selectedCustomer, (customer) => {
    if (!customer) return

    form.customer = customer.value
    form.email = customer.email
})

const form = reactive<Subscription>({
    id: 0,
    customer: '',
    email: '',
    plan: 'Basic',
    price: '$5/month',
    status: 'active',
    started_at: '',
    expired_at: '',
    websites: 1
})


watch(open, (value) => {
    if (!value) return

    Object.assign(form, {
        id: 0,
        customer: '',
        email: '',
        plan: 'Basic',
        price: '$5/month',
        status: 'active',
        started_at: '',
        expired_at: '',
        websites: 1
    })
})

function submit() {
    emit('submit', { ...form })
}
</script>