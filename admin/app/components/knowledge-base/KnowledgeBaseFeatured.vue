<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-highlighted">Featured Guides</h2>
        <p class="text-sm text-muted">
          Important documentation for users who are new to LCPANEL.
        </p>
      </div>

      <UBadge color="primary" variant="soft">
        {{ articles.length }} Featured
      </UBadge>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <UCard
        v-for="article in articles"
        :key="article.id"
        class="transition hover:-translate-y-0.5 hover:shadow-lg"
        :ui="{ body: 'space-y-4' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UIcon :name="article.icon" class="size-5" />
          </div>

          <UBadge :color="getStatusColor(article.status)" variant="soft">
            {{ formatLabel(article.status) }}
          </UBadge>
        </div>

        <div>
          <h3 class="font-semibold text-highlighted">
            {{ article.title }}
          </h3>
          <p class="mt-1 line-clamp-2 text-sm text-muted">
            {{ article.description }}
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in article.tags"
            :key="tag"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ tag }}
          </UBadge>
        </div>

        <div class="flex items-center justify-between border-t border-default pt-3 text-sm text-muted">
          <span>{{ article.readTime }} min read</span>

          <div class="flex gap-1">
            <UButton
              icon="i-lucide-arrow-up-right"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="emit('view', article)"
            >
              Open
            </UButton>

            <UButton
              v-if="canUpdate"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="emit('edit', article)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  ArticleStatus,
  KnowledgeBaseArticle
} from '~/types/knowledge-base'

defineProps<{
  articles: KnowledgeBaseArticle[]
  canUpdate: boolean
}>()

const emit = defineEmits<{
  view: [article: KnowledgeBaseArticle]
  edit: [article: KnowledgeBaseArticle]
}>()

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusColor(status: ArticleStatus) {
  const colors = {
    published: 'success',
    draft: 'warning',
    archived: 'neutral'
  } as const

  return colors[status]
}
</script>