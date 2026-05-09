<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-bold text-highlighted">All Articles</h2>
        <p class="text-sm text-muted">
          Showing {{ articles.length }} of {{ total }} articles.
        </p>
      </div>

      <UButton
        v-if="canUpdate"
        icon="i-lucide-folder-tree"
        color="neutral"
        variant="soft"
      >
        Manage Categories
      </UButton>
    </div>

    <div v-if="articles.length" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UCard
        v-for="article in articles"
        :key="article.id"
        class="transition hover:border-primary/40"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted">
              <UIcon :name="article.icon" class="size-5" />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-highlighted">
                  {{ article.title }}
                </h3>

                <UBadge
                  v-if="article.featured"
                  color="primary"
                  variant="soft"
                  size="sm"
                >
                  Featured
                </UBadge>
              </div>

              <p class="mt-1 line-clamp-2 text-sm text-muted">
                {{ article.description }}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <UBadge color="neutral" variant="soft">
                  {{ article.category }}
                </UBadge>

                <UBadge :color="getStatusColor(article.status)" variant="soft">
                  {{ formatLabel(article.status) }}
                </UBadge>

                <UBadge :color="getDifficultyColor(article.difficulty)" variant="soft">
                  {{ article.difficulty }}
                </UBadge>
              </div>
            </div>
          </div>

          <UDropdownMenu :items="getActions(article)">
            <UButton
              icon="i-lucide-more-horizontal"
              color="neutral"
              variant="ghost"
            />
          </UDropdownMenu>
        </div>

        <div class="mt-4 flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in article.tags"
              :key="tag"
              color="neutral"
              variant="outline"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>

          <div class="flex items-center gap-3 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-eye" class="size-4" />
              {{ article.views }}
            </span>

            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="size-4" />
              {{ article.readTime }} min
            </span>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-search-x" class="size-7" />
      </div>

      <h3 class="mt-4 font-semibold text-highlighted">No article found</h3>
      <p class="mt-1 text-sm text-muted">
        Try changing your search or filter.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  ArticleDifficulty,
  ArticleStatus,
  KnowledgeBaseArticle
} from '~/types/knowledge-base'

const props = defineProps<{
  articles: KnowledgeBaseArticle[]
  total: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  view: [article: KnowledgeBaseArticle]
  edit: [article: KnowledgeBaseArticle]
  archive: [article: KnowledgeBaseArticle]
  'toggle-featured': [article: KnowledgeBaseArticle]
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

function getDifficultyColor(difficulty: ArticleDifficulty) {
  const colors = {
    Beginner: 'success',
    Intermediate: 'primary',
    Advanced: 'warning'
  } as const

  return colors[difficulty]
}

function getActions(article: KnowledgeBaseArticle) {
  const actions = [
    [
      {
        label: 'View Article',
        icon: 'i-lucide-eye',
        onSelect: () => emit('view', article)
      }
    ]
  ]

  if (props.canUpdate) {
    actions.push([
      {
        label: 'Edit Article',
        icon: 'i-lucide-pencil',
        onSelect: () => emit('edit', article)
      },
      {
        label: article.featured ? 'Remove Featured' : 'Mark Featured',
        icon: 'i-lucide-star',
        onSelect: () => emit('toggle-featured', article)
      }
    ])
  }

  if (props.canDelete) {
    actions.push([
      {
        label: 'Archive',
        icon: 'i-lucide-archive',
        // color: 'error',
        onSelect: () => emit('archive', article)
      }
    ])
  }

  return actions
}
</script>