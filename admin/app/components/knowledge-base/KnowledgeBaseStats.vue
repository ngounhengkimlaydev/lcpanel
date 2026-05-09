<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard
      v-for="stat in stats"
      :key="stat.label"
      :ui="{ body: 'flex items-center justify-between gap-4' }"
    >
      <div>
        <p class="text-sm text-muted">{{ stat.label }}</p>
        <p class="mt-1 text-2xl font-bold text-highlighted">{{ stat.value }}</p>
      </div>

      <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UIcon :name="stat.icon" class="size-5" />
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { KnowledgeBaseArticle } from '~/types/knowledge-base'

const props = defineProps<{
  articles: KnowledgeBaseArticle[]
}>()

const stats = computed(() => [
  {
    label: 'Total Articles',
    value: props.articles.length,
    icon: 'i-lucide-files'
  },
  {
    label: 'Published',
    value: props.articles.filter((article) => article.status === 'published').length,
    icon: 'i-lucide-check-circle'
  },
  {
    label: 'Drafts',
    value: props.articles.filter((article) => article.status === 'draft').length,
    icon: 'i-lucide-file-pen-line'
  },
  {
    label: 'Total Views',
    value: props.articles
      .reduce((total, article) => total + article.views, 0)
      .toLocaleString(),
    icon: 'i-lucide-eye'
  }
])
</script>