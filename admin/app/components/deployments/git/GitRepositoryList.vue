<template>
  <div class="lg:col-span-1">
    <UInput
      v-model="searchModel"
      icon="i-lucide-search"
      placeholder="Search repository..."
      class="mb-4 w-full"
    />

    <div class="space-y-3">
      <button
        v-for="repo in repositories"
        :key="repo.id"
        type="button"
        class="w-full rounded-xl border border-default p-4 text-left transition hover:bg-muted"
        :class="selectedRepo?.id === repo.id ? 'bg-primary/10 ring-2 ring-primary' : ''"
        @click="$emit('select', repo)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-medium text-highlighted">
              {{ repo.name }}
            </p>

            <p class="mt-1 line-clamp-1 text-sm text-muted">
              {{ repo.description }}
            </p>
          </div>

          <UIcon
            :name="repo.provider === 'github' ? 'i-simple-icons-github' : 'i-simple-icons-gitlab'"
            class="size-5 text-muted"
          />
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <UBadge color="neutral" variant="soft">
            {{ repo.branch }}
          </UBadge>

          <UBadge color="neutral" variant="soft">
            {{ repo.framework }}
          </UBadge>
        </div>
      </button>

      <div
        v-if="!repositories.length"
        class="rounded-xl border border-dashed border-default p-6 text-center"
      >
        <p class="font-medium text-highlighted">
          No repository found
        </p>

        <p class="mt-1 text-sm text-muted">
          Try another search keyword.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { GitRepository } from "~/types/git"

const props = defineProps<{
  search: string
  repositories: GitRepository[]
  selectedRepo: GitRepository | null
}>()

const emit = defineEmits<{
  "update:search": [value: string]
  select: [repo: GitRepository]
}>()

const searchModel = computed({
  get: () => props.search,
  set: (value) => emit("update:search", value),
})
</script>