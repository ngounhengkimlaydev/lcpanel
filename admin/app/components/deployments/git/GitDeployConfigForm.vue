<template>
  <div class="rounded-2xl border border-default p-5">
    <div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold text-highlighted">
          {{ repo.name }}
        </h3>

        <p class="mt-1 text-sm text-muted">
          {{ repo.description }}
        </p>
      </div>

      <UBadge color="success" variant="soft">
        Ready
      </UBadge>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <UFormField label="Project Name">
        <UInput v-model="form.projectName" placeholder="my-project" />
      </UFormField>

      <UFormField label="Branch">
        <USelect
          v-model="form.branch"
          :items="branchOptions"
          placeholder="Select branch"
        />
      </UFormField>

      <UFormField label="Framework">
        <USelect
          v-model="form.framework"
          :items="frameworkOptions"
          placeholder="Select framework"
        />
      </UFormField>

      <UFormField label="Root Directory">
        <UInput v-model="form.rootDirectory" placeholder="./" />
      </UFormField>

      <UFormField label="Build Command">
        <UInput v-model="form.buildCommand" placeholder="pnpm build" />
      </UFormField>

      <UFormField label="Output Directory">
        <UInput v-model="form.outputDirectory" placeholder=".output/public" />
      </UFormField>

      <UFormField label="Install Command" class="md:col-span-2">
        <UInput v-model="form.installCommand" placeholder="pnpm install" />
      </UFormField>
    </div>

    <div class="mt-5 rounded-xl bg-muted p-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="size-4 text-primary" />

        <p class="text-sm font-medium text-highlighted">
          Deployment Settings
        </p>
      </div>

      <p class="mt-1 text-sm text-muted">
        After importing, LCPANEL can pull source code, install packages,
        build the app, and deploy it with PM2 or static hosting.
      </p>
    </div>

    <div class="mt-6 flex justify-end gap-3">
      <UButton color="neutral" variant="soft" @click="$emit('cancel')">
        Cancel
      </UButton>

      <UButton icon="i-lucide-download-cloud" @click="$emit('import')">
        Import Project
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  GitImportForm,
  GitRepository,
} from "~/types/git"

defineProps<{
  repo: GitRepository
  form: GitImportForm
  branchOptions: string[]
  frameworkOptions: string[]
}>()

defineEmits<{
  cancel: []
  import: []
}>()
</script>