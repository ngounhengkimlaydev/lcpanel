<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-highlighted">
            Import Project
          </h2>

          <p class="text-sm text-muted">
            Select a repository and configure how your app will be deployed.
          </p>
        </div>

        <UBadge color="primary" variant="soft">
          {{ repositories.length }} repositories
        </UBadge>
      </div>
    </template>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <GitRepositoryList
        v-model:search="searchModel"
        :repositories="visibleRepositories"
        :selected-repo="selectedRepo"
        :has-more="hasMoreRepositories"
        @select="selectedRepoModel = $event"
        @load-more="$emit('load-more')"
      />

      <div class="lg:col-span-2">
        <GitDeployConfigForm
          v-if="selectedRepo"
          :repo="selectedRepo"
          :form="form"
          :branch-options="branchOptions"
          :framework-options="frameworkOptions"
          :submitting="submitting"
          @cancel="$emit('cancel')"
          @deploy="$emit('deploy')"
        />

        <GitEmptyState v-else />
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  GitImportForm,
  GitRepository,
} from "~/types/git"
import GitDeployConfigForm from "./GitDeployConfigForm.vue";
import GitRepositoryList from "./GitRepositoryList.vue";

const props = defineProps<{
  search: string
  selectedRepo: GitRepository | null
  repositories: GitRepository[]
  filteredRepositories: GitRepository[]
  visibleRepositories: GitRepository[]
  hasMoreRepositories: boolean
  form: GitImportForm
  branchOptions: string[]
  frameworkOptions: string[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  "update:search": [value: string]
  "update:selectedRepo": [repo: GitRepository | null]
  cancel: []
  deploy: []
  "load-more": []
}>()

const searchModel = computed({
  get: () => props.search,
  set: (value) => emit("update:search", value),
})

const selectedRepoModel = computed({
  get: () => props.selectedRepo,
  set: (repo) => emit("update:selectedRepo", repo),
})
</script>
