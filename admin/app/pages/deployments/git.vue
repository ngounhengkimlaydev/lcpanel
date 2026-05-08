<template>
    <div class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-highlighted">Git Repository</h1>
                <p class="mt-1 text-sm text-muted">
                    Connect GitHub or GitLab and import your project for deployment.
                </p>
            </div>

            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft">
                Refresh
            </UButton>
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <UCard v-for="provider in providers" :key="provider.key"
                class="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg" :ui="{ body: 'space-y-4' }">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon :name="provider.icon" class="size-6" />
                        </div>

                        <div>
                            <h3 class="font-semibold text-highlighted">
                                {{ provider.name }}
                            </h3>
                            <p class="text-sm text-muted">
                                {{ provider.description }}
                            </p>
                        </div>
                    </div>

                    <UBadge :color="provider.connected ? 'success' : 'neutral'" variant="soft">
                        {{ provider.connected ? 'Connected' : 'Not Connected' }}
                    </UBadge>
                </div>

                <UButton block :icon="provider.connected ? 'i-lucide-link' : 'i-lucide-plug'"
                    :color="provider.connected ? 'neutral' : 'primary'"
                    :variant="provider.connected ? 'soft' : 'solid'">
                    {{ provider.connected ? 'Manage Connection' : `Connect ${provider.name}` }}
                </UButton>
            </UCard>
        </div>

        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-highlighted">Import Project</h2>
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
                <div class="lg:col-span-1">
                    <UInput v-model="search" icon="i-lucide-search" placeholder="Search repository..."
                        class="mb-4 w-full" />

                    <div class="space-y-3">
                        <button v-for="repo in filteredRepositories" :key="repo.id" type="button"
                            class="w-full rounded-xl border border-default p-4 text-left transition hover:bg-muted"
                            :class="selectedRepo?.id === repo.id ? 'bg-primary/10 ring-2 ring-primary' : ''"
                            @click="selectedRepo = repo">
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
                                    class="size-5 text-muted" />
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
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div v-if="selectedRepo" class="rounded-2xl border border-default p-5">
                        <div class="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-bold text-highlighted">
                                    {{ selectedRepo.name }}
                                </h3>
                                <p class="mt-1 text-sm text-muted">
                                    {{ selectedRepo.description }}
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
                                <USelect v-model="form.branch" :items="branchOptions" placeholder="Select branch" />
                            </UFormField>

                            <UFormField label="Framework">
                                <USelect v-model="form.framework" :items="frameworkOptions"
                                    placeholder="Select framework" />
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
                            <UButton color="neutral" variant="soft">
                                Cancel
                            </UButton>

                            <UButton icon="i-lucide-download-cloud">
                                Import Project
                            </UButton>
                        </div>
                    </div>

                    <div v-else
                        class="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-default p-8 text-center">
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
                </div>
            </div>
        </UCard>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.GIT_REPO,
})

type ProviderKey = "github" | "gitlab"

interface Provider {
    key: ProviderKey
    name: string
    icon: string
    description: string
    connected: boolean
}

interface Repository {
    id: number
    provider: ProviderKey
    name: string
    description: string
    branch: string
    framework: string
}

const search = ref("")

const providers = ref<Provider[]>([
    {
        key: "github",
        name: "GitHub",
        icon: "i-simple-icons-github",
        description: "Import public or private repositories from GitHub.",
        connected: true,
    },
    {
        key: "gitlab",
        name: "GitLab",
        icon: "i-simple-icons-gitlab",
        description: "Connect your GitLab account or self-hosted GitLab.",
        connected: false,
    },
    {
        key: "github",
        name: "Manual Git URL",
        icon: "i-lucide-git-branch-plus",
        description: "Import using HTTPS or SSH Git repository URL.",
        connected: false,
    },
])

const repositories = ref<Repository[]>([
    {
        id: 1,
        provider: "github",
        name: "lcpanel-admin",
        description: "Nuxt admin dashboard for server control panel.",
        branch: "main",
        framework: "Nuxt",
    },
    {
        id: 2,
        provider: "github",
        name: "lcpanel-core",
        description: "NestJS API service with Prisma and PM2.",
        branch: "main",
        framework: "NestJS",
    },
    {
        id: 3,
        provider: "gitlab",
        name: "client-website",
        description: "Laravel website project for shared hosting.",
        branch: "production",
        framework: "Laravel",
    },
])

const selectedRepo = ref<Repository | null>(repositories.value[0] ?? null)

const form = reactive({
    projectName: "lcpanel-admin",
    branch: "main",
    framework: "Nuxt",
    rootDirectory: "./",
    installCommand: "pnpm install",
    buildCommand: "pnpm build",
    outputDirectory: ".output",
})

const branchOptions = ["main", "master", "production", "develop"]

const frameworkOptions = [
    "Nuxt",
    "Next.js",
    "Vue",
    "React",
    "NestJS",
    "Laravel",
    "Node.js",
    "Static HTML",
]

const filteredRepositories = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    if (!keyword) return repositories.value

    return repositories.value.filter((repo) =>
        [repo.name, repo.description, repo.framework, repo.branch]
            .join(" ")
            .toLowerCase()
            .includes(keyword),
    )
})

watch(selectedRepo, (repo) => {
    if (!repo) return

    form.projectName = repo.name
    form.branch = repo.branch
    form.framework = repo.framework
})
</script>