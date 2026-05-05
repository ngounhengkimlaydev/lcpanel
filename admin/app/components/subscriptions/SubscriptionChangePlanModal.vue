<template>
    <UModal v-model:open="open">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-bold text-highlighted">Change Plan</h3>
                </template>

                <div class="space-y-4">
                    <UFormField label="Plan">
                        <USelect v-model="selectedPlan" :items="plans" class="w-full" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
                        <UButton label="Save Changes" icon="i-lucide-save" @click="submit" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { Subscription } from '~/types'

type PlanName = 'Basic' | 'Business' | 'Enterprise'

const props = defineProps<{
    subscription: Subscription | null
}>()

const emit = defineEmits<{
    submit: [payload: { id: number; plan: string; price: string }]
}>()

const open = defineModel<boolean>('open', { default: false })

const selectedPlan = ref<PlanName>('Basic')

const plans: PlanName[] = ['Basic', 'Business', 'Enterprise']

const prices: Record<PlanName, string> = {
    Basic: '$5/month',
    Business: '$15/month',
    Enterprise: '$49/month'
}

watch(open, (value) => {
    if (!value || !props.subscription) return
    selectedPlan.value = props.subscription.plan as PlanName
})

function submit() {
    if (!props.subscription) return

    emit('submit', {
        id: props.subscription.id,
        plan: selectedPlan.value,
        price: prices[selectedPlan.value]
    })
}
</script>