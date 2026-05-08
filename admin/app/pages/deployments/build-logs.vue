<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-bold text-highlighted">Build Logs</h1>
            <p class="mt-1 text-sm text-muted">
                View deployment build output, errors, and runtime steps.
            </p>
        </div>

        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-highlighted">Deployment Logs</h2>
                        <p class="text-sm text-muted">
                            Track install, build, and deploy process from your Git projects.
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search logs..."
                            class="w-full sm:w-72" />

                        <USelect v-model="status" :items="statusOptions" placeholder="Status" class="w-full sm:w-40" />
                    </div>
                </div>
            </template>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="space-y-3">
                    <button v-for="log in filteredLogs" :key="log.id" type="button"
                        class="w-full rounded-xl border border-default p-4 text-left transition hover:bg-muted"
                        :class="selectedLog?.id === log.id ? 'bg-primary/10 ring-2 ring-primary' : ''"
                        @click="selectedLog = log">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="font-medium text-highlighted">{{ log.project }}</p>
                                <p class="mt-1 text-sm text-muted">{{ log.commit }}</p>
                            </div>

                            <UBadge :color="getStatusColor(log.status)" variant="soft">
                                {{ log.status }}
                            </UBadge>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <UBadge color="neutral" variant="soft">{{ log.branch }}</UBadge>
                            <UBadge color="neutral" variant="soft">{{ log.duration }}</UBadge>
                        </div>
                    </button>

                    <div v-if="!filteredLogs.length"
                        class="rounded-xl border border-dashed border-default p-6 text-center">
                        <UIcon name="i-lucide-scroll-text" class="mx-auto mb-2 size-8 text-muted" />
                        <p class="text-sm font-medium text-highlighted">No logs found</p>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div v-if="selectedLog" class="overflow-hidden rounded-2xl border border-default">
                        <div class="border-b border-default p-4">
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div class="flex flex-wrap items-center gap-2">
                                        <h3 class="text-lg font-bold text-highlighted">
                                            {{ selectedLog.project }}
                                        </h3>

                                        <UBadge :color="getStatusColor(selectedLog.status)" variant="soft">
                                            {{ selectedLog.status }}
                                        </UBadge>
                                    </div>

                                    <p class="mt-1 text-sm text-muted">
                                        {{ selectedLog.branch }} • {{ selectedLog.commit }} • {{ selectedLog.createdAt
                                        }}
                                    </p>
                                </div>

                                <div class="flex gap-2">
                                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" size="sm">
                                        Refresh
                                    </UButton>

                                    <UButton icon="i-lucide-download" color="neutral" variant="soft" size="sm">
                                        Download
                                    </UButton>
                                </div>
                            </div>
                        </div>

                        <div class="bg-inverted p-4">
                            <div class="mb-3 flex flex-wrap gap-2">
                                <UBadge color="neutral" variant="soft">
                                    Install: {{ selectedLog.installTime }}
                                </UBadge>
                                <UBadge color="neutral" variant="soft">
                                    Build: {{ selectedLog.buildTime }}
                                </UBadge>
                                <UBadge color="neutral" variant="soft">
                                    Deploy: {{ selectedLog.deployTime }}
                                </UBadge>
                            </div>

                            <pre
                                class="max-h-[620px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-inverted"><code>{{
                        selectedLog.output }}</code></pre>
                        </div>
                    </div>

                    <div v-else
                        class="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-default p-8 text-center">
                        <UIcon name="i-lucide-terminal" class="mb-3 size-10 text-muted" />
                        <p class="font-medium text-highlighted">Select a build log</p>
                        <p class="mt-1 text-sm text-muted">
                            Choose a deployment log from the left side to view details.
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
    moduleKey: moduleKey.BUILD_LOGS,
})

type BuildStatus = "success" | "running" | "failed" | "cancelled"

interface BuildLog {
    id: number
    project: string
    branch: string
    commit: string
    status: BuildStatus
    duration: string
    createdAt: string
    installTime: string
    buildTime: string
    deployTime: string
    output: string
}

const search = ref("")
const status = ref("all")

const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Success", value: "success" },
    { label: "Running", value: "running" },
    { label: "Failed", value: "failed" },
    { label: "Cancelled", value: "cancelled" },
]

const logs = ref<BuildLog[]>([
    {
        id: 1,
        project: "lcpanel-admin",
        branch: "main",
        commit: "a82f13c - update deploy page",
        status: "success",
        duration: "1m 24s",
        createdAt: "2 minutes ago",
        installTime: "32s",
        buildTime: "44s",
        deployTime: "8s",
        output: `$ git pull origin main
Already up to date.

$ pnpm install
Packages are up to date.

$ pnpm build
Nuxt build completed successfully.

$ pm2 restart lcpanel-admin
Application restarted successfully.

Deployment completed.`,
    },
    {
        id: 2,
        project: "lcpanel-core",
        branch: "main",
        commit: "f91b22a - add deployment api",
        status: "running",
        duration: "Running",
        createdAt: "Now",
        installTime: "21s",
        buildTime: "Running",
        deployTime: "-",
        output: `$ git pull origin main
Updating source code...

$ pnpm install
Installing dependencies...

$ pnpm prisma generate
Prisma client generated.

$ pnpm build
Building NestJS application...`,
    },
    {
        id: 3,
        project: "client-website",
        branch: "production",
        commit: "c34e901 - fix homepage",
        status: "failed",
        duration: "42s",
        createdAt: "1 hour ago",
        installTime: "18s",
        buildTime: "24s",
        deployTime: "-",
        output: `$ git pull origin production
Source updated.

$ composer install
Dependencies installed.

$ php artisan migrate --force
Migration completed.

$ npm run build
Build failed: missing environment variable APP_URL.

Deployment failed.`,
    },
])

const selectedLog = ref<BuildLog | null>(logs.value[0] ?? null)

const filteredLogs = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    return logs.value.filter((log) => {
        const matchSearch =
            !keyword ||
            [log.project, log.branch, log.commit, log.output]
                .join(" ")
                .toLowerCase()
                .includes(keyword)

        const matchStatus = status.value === "all" || log.status === status.value

        return matchSearch && matchStatus
    })
})

function getStatusColor(status: BuildStatus) {
    switch (status) {
        case "success":
            return "success"
        case "running":
            return "warning"
        case "failed":
            return "error"
        case "cancelled":
            return "neutral"
        default:
            return "neutral"
    }
}
</script>