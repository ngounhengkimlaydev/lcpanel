<template>
    <UModal v-model:open="open" fullscreen>
        <template #header>
            <div>
                <h3 class="text-lg font-bold text-highlighted">Create Knowledge Article</h3>
                <p class="text-sm text-muted">
                    Add a new guide, FAQ, or troubleshooting document for LCPANEL users.
                </p>
            </div>
        </template>
        <template #body>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UFormField label="Title" required>
                    <UInput v-model="form.title" placeholder="Example: How to create a website" />
                </UFormField>

                <UFormField label="Category" required>
                    <USelect v-model="form.category" :items="categoryOptions" value-key="value" />
                </UFormField>

                <UFormField label="Status">
                    <USelect v-model="form.status" :items="statusOptions" value-key="value" />
                </UFormField>

                <UFormField label="Difficulty">
                    <USelect v-model="form.difficulty" :items="difficultyOptions" value-key="value" />
                </UFormField>

                <UFormField label="Read Time">
                    <UInput v-model.number="form.readTime" type="number" min="1" placeholder="5" />
                </UFormField>

                <UFormField label="Tags">
                    <UInput v-model="form.tags" placeholder="hosting, website, nginx" />
                </UFormField>

                <UFormField label="Description" class="md:col-span-2">
                    <UTextarea v-model="form.description" :rows="4"
                        placeholder="Write a short summary for this article..." />
                </UFormField>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton color="neutral" variant="soft" @click="open = false">
                    Cancel
                </UButton>

                <UButton icon="i-lucide-save" @click="submit">
                    Create Article
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
import type { KnowledgeBaseForm } from '~/types/knowledge-base'

type SelectOption = {
    label: string
    value: string
}

defineProps<{
    categoryOptions: SelectOption[]
    statusOptions: SelectOption[]
    difficultyOptions: SelectOption[]
}>()

const emit = defineEmits<{
    submit: [form: KnowledgeBaseForm]
}>()

const open = defineModel<boolean>('open', {
    default: false
})

const form = reactive<KnowledgeBaseForm>({
    title: '',
    description: '',
    category: 'Getting Started',
    status: 'draft',
    difficulty: 'Beginner',
    readTime: 5,
    tags: ''
})

watch(open, (value) => {
    if (!value) return

    resetForm()
})

function resetForm() {
    Object.assign(form, {
        title: '',
        description: '',
        category: 'Getting Started',
        status: 'draft',
        difficulty: 'Beginner',
        readTime: 5,
        tags: ''
    })
}

function submit() {
    if (!form.title.trim()) return

    emit('submit', { ...form })

    open.value = false
}
</script>