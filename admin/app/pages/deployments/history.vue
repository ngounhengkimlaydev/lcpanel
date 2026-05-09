<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-bold text-highlighted">Deploy History</h1>
            <p class="mt-1 text-sm text-muted">
                View Git commits, deployment timeline, rollback points, and release status.
            </p>
        </div>

        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-highlighted">Deployment Timeline</h2>
                        <p class="text-sm text-muted">
                            Track every deployment from your connected Git repositories.
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search project, branch, commit..."
                            class="w-full sm:w-72" />

                        <USelect v-model="status" :items="statusOptions" placeholder="Status" class="w-full sm:w-40" />
                    </div>
                </div>
            </template>

            <div class="space-y-4">
                <div v-for="item in filteredHistory" :key="item.id" class="rounded-2xl border border-default p-4">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="flex gap-4">
                            <div class="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl"
                                :class="getIconClass(item.status)">
                                <UIcon :name="getStatusIcon(item.status)" class="size-5" />
                            </div>

                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="font-bold text-highlighted">{{ item.project }}</h3>

                                    <UBadge :color="getStatusColor(item.status)" variant="soft">
                                        {{ item.status }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        {{ item.environment }}
                                    </UBadge>
                                </div>

                                <p class="mt-1 text-sm text-muted">
                                    {{ item.message }}
                                </p>

                                <div class="mt-3 flex flex-wrap gap-2">
                                    <UBadge color="neutral" variant="soft">
                                        <UIcon name="i-lucide-git-branch" class="mr-1 size-3" />
                                        {{ item.branch }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        <UIcon name="i-lucide-git-commit-horizontal" class="mr-1 size-3" />
                                        {{ item.commit }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        <UIcon name="i-lucide-clock" class="mr-1 size-3" />
                                        {{ item.duration }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 lg:justify-end">
                            <UButton icon="i-lucide-scroll-text" size="sm" color="neutral" variant="soft"
                                to="/deployments/build-logs">
                                Logs
                            </UButton>

                            <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="soft"
                                :disabled="item.status === 'running'">
                                Rollback
                            </UButton>

                            <UDropdownMenu :items="getActions(item)">
                                <UButton icon="i-lucide-more-horizontal" size="sm" color="neutral" variant="ghost" />
                            </UDropdownMenu>
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-4 md:grid-cols-4">
                        <div>
                            <p class="text-xs text-muted">Author</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ item.author }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Deployed At</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ item.deployedAt }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Version</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ item.version }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Domain</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ item.domain }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="!filteredHistory.length"
                    class="rounded-2xl border border-dashed border-default p-10 text-center">
                    <UIcon name="i-lucide-history" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No deployment history found</p>
                    <p class="mt-1 text-sm text-muted">
                        Try changing your search or status filter.
                    </p>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.GIT_HISTORY,
})

type HistoryStatus = "success" | "running" | "failed" | "cancelled"

interface DeployHistory {
    id: number
    project: string
    message: string
    branch: string
    commit: string
    status: HistoryStatus
    environment: string
    author: string
    deployedAt: string
    duration: string
    version: string
    domain: string
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

const api = useApiFetch()
const toast = useToast()
const history = ref<DeployHistory[]>([])

onMounted(getHistory)

async function getHistory() {
    const res: any = await api.get('/deployments/history')

    history.value = res.data || []
}

const filteredHistory = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    return history.value.filter((item) => {
        const matchSearch =
            !keyword ||
            [
                item.project,
                item.message,
                item.branch,
                item.commit,
                item.author,
                item.domain,
            ]
                .join(" ")
                .toLowerCase()
                .includes(keyword)

        const matchStatus = status.value === "all" || item.status === status.value

        return matchSearch && matchStatus
    })
})

function getStatusColor(status: HistoryStatus) {
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

function getStatusIcon(status: HistoryStatus) {
    switch (status) {
        case "success":
            return "i-lucide-circle-check"
        case "running":
            return "i-lucide-loader"
        case "failed":
            return "i-lucide-circle-x"
        case "cancelled":
            return "i-lucide-ban"
        default:
            return "i-lucide-clock"
    }
}

function getIconClass(status: HistoryStatus) {
    switch (status) {
        case "success":
            return "bg-success/10 text-success"
        case "running":
            return "bg-warning/10 text-warning"
        case "failed":
            return "bg-error/10 text-error"
        case "cancelled":
            return "bg-muted text-muted"
        default:
            return "bg-muted text-muted"
    }
}

function getActions(item: DeployHistory) {
    return [
        [
            {
                label: "View Commit",
                icon: "i-lucide-git-commit-horizontal",
            },
            {
                label: "View Build Logs",
                icon: "i-lucide-scroll-text",
                to: "/deployments/build-logs",
            },
        ],
        [
            {
                label: "Redeploy",
                icon: "i-lucide-rocket",
                disabled: item.status === "running",
                onSelect: () => redeploy(item),
            },
            {
                label: "Copy Commit Hash",
                icon: "i-lucide-copy",
            },
        ],
    ]
}

async function redeploy(item: DeployHistory) {
    await api.post(`/deployments/projects/${item.id}/pull`, {
        install: true,
        build: true,
        restart: true,
    })

    toast.add({
        title: 'Redeploy started',
        color: 'success',
    })

    await getHistory()
}
</script>
