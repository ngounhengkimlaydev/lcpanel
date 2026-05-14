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
                <div v-if="!loading" v-for="item in visibleHistory" :key="item.id"
                    class="rounded-2xl border border-default p-4">
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
                                :to="{ path: '/deployments/build-logs', query: { project: String(item.projectId) } }">
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

                <div v-else class="rounded-2xl border border-default p-4" v-for="index in 2">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div class="flex gap-4">
                            <USkeleton class="mt-1 size-11 shrink-0 rounded-xl" />

                            <div class="flex-1 space-y-3">
                                <div class="flex flex-wrap items-center gap-2">
                                    <USkeleton class="h-5 w-32" />
                                    <USkeleton class="h-5 w-20 rounded-full" />
                                    <USkeleton class="h-5 w-24 rounded-full" />
                                </div>

                                <div class="space-y-2">
                                    <USkeleton class="h-4 w-72 max-w-full" />
                                    <USkeleton class="h-4 w-56 max-w-full" />
                                </div>

                                <div class="flex flex-wrap gap-2">
                                    <USkeleton class="h-5 w-24 rounded-full" />
                                    <USkeleton class="h-5 w-28 rounded-full" />
                                    <USkeleton class="h-5 w-20 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 lg:justify-end">
                            <USkeleton class="h-8 w-20 rounded-md" />
                            <USkeleton class="h-8 w-24 rounded-md" />
                            <USkeleton class="h-8 w-8 rounded-md" />
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-4 md:grid-cols-4">
                        <div class="space-y-2">
                            <USkeleton class="h-3 w-14" />
                            <USkeleton class="h-4 w-24" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-20" />
                            <USkeleton class="h-4 w-32" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-16" />
                            <USkeleton class="h-4 w-20" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-16" />
                            <USkeleton class="h-4 w-40" />
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

                <div
                    v-if="hasMoreHistory"
                    ref="loadMoreTrigger"
                    class="h-1"
                />
            </div>
        </UCard>
    </div>
</template>

<script lang="ts" setup>
import type { DeployHistory, HistoryStatus } from '~/types/deploy-history'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.GIT_HISTORY,
})

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
const loading = ref<boolean>(false)
const historyPageSize = 8
const visibleHistoryCount = ref(historyPageSize)
const loadMoreTrigger = ref<HTMLElement | null>(null)

onMounted(getHistory)

async function getHistory() {
    loading.value = true
    try {
        const res: any = await api.get('/deployments/history')

        history.value = res.data || []
        visibleHistoryCount.value = historyPageSize
    } finally {
        loading.value = false
    }
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

const visibleHistory = computed(() =>
    filteredHistory.value.slice(0, visibleHistoryCount.value)
)

const hasMoreHistory = computed(() =>
    visibleHistoryCount.value < filteredHistory.value.length
)

watch([search, status], () => {
    visibleHistoryCount.value = historyPageSize
})

useIntersectionObserver(loadMoreTrigger, ([entry]) => {
    if (entry?.isIntersecting && hasMoreHistory.value) {
        visibleHistoryCount.value += historyPageSize
    }
}, {
    rootMargin: '240px',
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
                to: {
                    path: "/deployments/build-logs",
                    query: { project: String(item.projectId) },
                },
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
    await api.post(`/deployments/projects/${item.projectId}/pull`, {
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
