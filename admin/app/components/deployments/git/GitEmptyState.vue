<template>
  <div
    class="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-default p-8 text-center"
  >
    <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <UIcon name="i-lucide-git-branch" class="size-7" />
    </div>

    <h3 class="mt-4 text-lg font-bold text-highlighted">
      Select a repository
    </h3>

    <p class="mt-1 max-w-md text-sm text-muted">
      Choose a GitHub or GitLab repository from the list to configure
      your project import.
    </p>
  </div>
</template>