<template>
    <UModal v-model:open="open">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-bold text-highlighted">
                        {{ type === 'create' ? 'Add Subdomain' : 'Edit Subdomain' }}
                    </h3>
                </template>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UFormField label="Subdomain">
                        <UInput v-model="form.subdomain" class="w-full" placeholder="api" />
                    </UFormField>

                    <UFormField label="Domain">
                        <UInput v-model="form.domain" class="w-full" placeholder="example.com" />
                    </UFormField>

                    <UFormField label="Document Root">
                        <UInput v-model="form.document_root" class="w-full" />
                    </UFormField>

                    <UFormField label="Status">
                        <USelect v-model="form.status" :items="statuses" class="w-full" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
                        <UButton :label="type === 'create' ? 'Add Subdomain' : 'Save Changes'" icon="i-lucide-save"
                            @click="submit" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { SubdomainItem } from '~/types/website'

const props = defineProps<{ type: 'create' | 'edit', subdomain: SubdomainItem | null }>()
const emit = defineEmits<{ submit: [subdomain: SubdomainItem] }>()
const open = defineModel<boolean>('open', { default: false })

const statuses = ['active', 'disabled', 'pending']

const form = reactive<SubdomainItem>({
    id: 0,
    subdomain: '',
    domain: '',
    document_root: '/var/www/',
    status: 'active',
    created_at: ''
})

watch(() => open.value, (value) => {
    if (!value) return

    if (props.type === 'edit' && props.subdomain) {
        Object.assign(form, props.subdomain)
    } else {
        Object.assign(form, {
            id: 0,
            subdomain: '',
            domain: '',
            document_root: '/var/www/',
            status: 'active',
            created_at: ''
        })
    }
})

function submit() {
    emit('submit', { ...form })
}
</script>