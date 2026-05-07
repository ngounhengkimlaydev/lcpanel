<template>
    <UModal v-model:open="open">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-bold text-highlighted">
                        {{ type === 'create' ? 'Add Redirect' : 'Edit Redirect' }}
                    </h3>
                </template>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UFormField label="Source URL">
                        <UInput v-model="form.source" class="w-full" placeholder="http://example.com" />
                    </UFormField>

                    <UFormField label="Target URL">
                        <UInput v-model="form.target" class="w-full" placeholder="https://example.com" />
                    </UFormField>

                    <UFormField label="Redirect Type">
                        <USelect v-model="form.type" :items="types" class="w-full" />
                    </UFormField>

                    <UFormField label="Status">
                        <USelect v-model="form.status" :items="statuses" class="w-full" />
                    </UFormField>

                    <UFormField label="Force HTTPS">
                        <USwitch v-model="form.https" />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancel" color="neutral" variant="ghost" @click="open = false" />
                        <UButton :label="type === 'create' ? 'Add Redirect' : 'Save Changes'" icon="i-lucide-save"
                            @click="submit" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { RedirectItem } from '~/types/website'

const props = defineProps<{ type: 'create' | 'edit', redirect: RedirectItem | null }>()
const emit = defineEmits<{ submit: [redirect: RedirectItem] }>()
const open = defineModel<boolean>('open', { default: false })

const types = ['301', '302']
const statuses = ['active', 'disabled', 'pending']

const form = reactive<RedirectItem>({
    id: 0,
    source: '',
    target: '',
    type: '301',
    https: true,
    status: 'active',
    created_at: ''
})

watch(() => open.value, (value) => {
    if (!value) return

    if (props.type === 'edit' && props.redirect) {
        Object.assign(form, props.redirect)
    } else {
        Object.assign(form, {
            id: 0,
            source: '',
            target: '',
            type: '301',
            https: true,
            status: 'active',
            created_at: ''
        })
    }
})

function submit() {
    emit('submit', { ...form })
}
</script>