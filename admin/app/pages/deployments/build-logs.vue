<template>
    <UCard
        :ui="{
            root: 'overflow-visible',
            header: 'border-b border-default',
            body: 'p-0'
        }"
    >
        <template #header>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-highlighted">
                        Build Logs
                    </h1>

                    <p class="mt-1 text-sm text-muted">
                        View deployment build output, errors, and runtime steps.
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-upload"
                        label="Share"
                    />

                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-ellipsis"
                    />
                </div>
            </div>
        </template>

        <div class="grid lg:grid-cols-[420px_1fr]">
            <div class="border-b border-default px-6 py-5 lg:col-span-2">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 class="text-lg font-bold text-highlighted">
                            Recent Builds
                        </h2>

                        <p class="text-sm text-muted">
                            Select a deployment to inspect its latest build output.
                        </p>
                    </div>

                    <UBadge
                        color="neutral"
                        variant="soft"
                    >
                        {{ logs.length }} builds
                    </UBadge>
                </div>

                <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <button
                        v-for="log in visibleLogs"
                        :key="log.id"
                        type="button"
                        class="rounded-xl border border-default p-4 text-left transition hover:bg-muted"
                        :class="selectedLog?.id === log.id ? 'bg-primary/10 ring-2 ring-primary' : ''"
                        @click="selectLogEntry(log)"
                    >
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <p class="font-semibold text-highlighted">
                                    {{ log.project }}
                                </p>

                                <p class="mt-1 text-sm text-muted">
                                    {{ log.branch }} · {{ log.commit }}
                                </p>
                            </div>

                            <UBadge
                                :color="getStatusColor(log.status)"
                                variant="soft"
                            >
                                {{ log.status }}
                            </UBadge>
                        </div>

                        <div class="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
                            <span>{{ formatDateTime(log.createdAt) }}</span>
                            <span>{{ log.duration }}</span>
                        </div>
                    </button>
                </div>

                <div
                    v-if="hasMoreLogs"
                    ref="loadMoreTrigger"
                    class="h-1"
                />
            </div>

            <!-- Website Preview -->
            <div>
                <div class="relative h-65 overflow-hidden rounded-xl border border-default bg-muted shadow-sm">
                    <iframe
                        :src="selectedDeployment.deploy_url"
                        class="absolute left-0 top-0 h-[720px] w-[1280px] origin-top-left scale-[0.33] border-0"
                        loading="lazy"
                    />
                </div>
            </div>

            <!-- Deployment Info -->
            <div class="p-6">
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="space-y-4">
                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Created
                            </p>

                            <div class="flex items-center gap-3">
                                <UAvatar
                                    src="https://github.com/ngounhengkimlay.png"
                                    size="lg"
                                />

                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="font-semibold text-highlighted">
                                        {{ selectedDeployment.project }}
                                    </span>

                                    <span class="text-muted">
                                        {{ selectedDeployment.created_at }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Duration
                            </p>

                            <div class="flex items-center gap-3">
                                <UIcon
                                    name="i-lucide-clock-3"
                                    class="size-6 text-muted"
                                />

                                <div class="flex items-center gap-2">
                                    <span class="font-semibold text-highlighted">
                                        {{ selectedDeployment.duration }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Domains
                            </p>

                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <UIcon
                                        name="i-lucide-globe"
                                        class="size-6 text-muted"
                                    />

                                    <span class="font-medium text-highlighted">
                                        {{ selectedDeployment.domain }}
                                    </span>

                                    <UBadge
                                        label="Live"
                                        color="success"
                                        variant="soft"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-8">
                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Status
                            </p>

                            <div class="flex items-center gap-3">
                                <span
                                    class="size-3 rounded-full"
                                    :class="statusDotClass"
                                />

                                <span class="font-semibold text-highlighted">
                                    {{ statusLabel }}
                                </span>

                                <span class="text-muted">Latest</span>
                            </div>
                        </div>

                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Package Plan
                            </p>

                            <div class="flex items-center gap-3">
                                <UIcon
                                    name="i-lucide-arrow-up-circle"
                                    class="size-6 text-muted"
                                />

                                <span class="font-semibold text-highlighted">
                                    {{ selectedDeployment.packagePlan }}
                                </span>

                                <UBadge
                                    label="Current"
                                    color="primary"
                                    variant="soft"
                                />
                            </div>
                        </div>

                        <div>
                            <p class="mb-3 text-sm font-medium text-muted">
                                Source
                            </p>

                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <UIcon
                                        name="i-lucide-git-branch"
                                        class="size-6 text-muted"
                                    />

                                    <span class="font-medium text-highlighted">
                                        {{ selectedDeployment.branch }}
                                    </span>
                                </div>

                                <div class="flex items-center gap-3">
                                    <UIcon
                                        name="i-lucide-git-commit-horizontal"
                                        class="size-6 text-muted"
                                    />

                                    <span class="font-medium text-highlighted">
                                        {{ selectedDeployment.commit }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <!-- System Environment -->
            <UCollapsible class="flex w-full flex-col gap-2">
                <template #default="{ open }">
                    <UButton
                        color="neutral"
                        variant="ghost"
                        size="xl"
                        block
                        :trailing-icon="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                        :ui="{
                            base: 'border-0 bg-transparent px-0 shadow-none ring-0 hover:bg-transparent'
                        }"
                    >
                        <div class="flex w-full items-center justify-between">
                            <span class="font-semibold text-highlighted">
                                System Environments
                            </span>
                        </div>
                    </UButton>
                </template>

                <template #content>
                    <div class="rounded-xl border border-default p-4">
                        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p class="text-sm text-muted">Install Time</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.installTime }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Build Time</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.buildTime }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Deploy Time</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.deployTime }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Total Duration</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.duration }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Package Plan</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.packagePlan }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Node Version</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.nodeVersion }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">PHP Version</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.phpVersion }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Branch</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.branch }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Commit</p>
                                <p class="font-semibold text-highlighted">
                                    {{ selectedDeployment.commit }}
                                </p>
                            </div>

                            <div>
                                <p class="text-sm text-muted">Status</p>
                                <UBadge
                                    :label="statusLabel"
                                    :color="getStatusColor(selectedDeployment.status)"
                                    variant="soft"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </UCollapsible>

            <!-- Build Logs -->
            <UCollapsible class="w-full">
                <template #default="{ open }">
                    <UButton
                        color="neutral"
                        variant="ghost"
                        size="xl"
                        block
                        :trailing-icon="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                        :ui="{
                            base: 'border-0 bg-transparent shadow-none ring-0 hover:bg-transparent px-0'
                        }"
                    >
                        <div class="flex w-full items-center justify-between">
                            <span class="font-semibold text-highlighted">
                                Build Logs
                            </span>
                        </div>
                    </UButton>
                </template>

                <template #content>
                    <div class="pt-4">
                        <div class="overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-xl">
                            <div class="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <span class="h-3 w-3 rounded-full bg-red-500" />
                                    <span class="h-3 w-3 rounded-full bg-yellow-500" />
                                    <span class="h-3 w-3 rounded-full bg-green-500" />
                                </div>

                                <div class="flex items-center gap-2 text-sm text-neutral-400">
                                    <UIcon name="i-lucide-terminal" class="size-4" />
                                    <span>{{ selectedDeployment.project }}.log</span>
                                </div>

                                <div />
                            </div>

                            <div class="max-h-125 overflow-auto p-5 font-mono text-sm leading-7 text-white">
                                <pre class="whitespace-pre-wrap">{{ selectedDeployment.output }}</pre>
                            </div>
                        </div>
                    </div>
                </template>
            </UCollapsible>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
import type { BuildLog, BuildStatus } from '~/types/build-log'

definePageMeta({
    middleware: 'alc',
    moduleKey: moduleKey.BUILD_LOGS,
})

const route = useRoute()
const api = useApiFetch()
const { $socket } = useNuxtApp()
const token = useCookie<string | null>('token')

const logs = ref<BuildLog[]>([])
const selectedLog = ref<BuildLog | null>(null)
const logsPageSize = 9
const visibleLogCount = ref(logsPageSize)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const PENDING_LOG_OUTPUT =
    'Build log is being prepared. Waiting for live websocket updates...'

const selectedDeployment = computed(() => {
    const log = selectedLog.value

    return {
        id: log?.id ?? null,
        project: log?.project ?? '-',
        branch: log?.branch ?? '-',
        commit: log?.commit ?? '-',
        status: log?.status ?? 'running',
        duration: log?.duration ?? '-',
        created_at: formatDateTime(log?.createdAt),
        installTime: log?.installTime ?? '-',
        buildTime: log?.buildTime ?? '-',
        deployTime: log?.deployTime ?? '-',
        output: log?.output ?? '',
        packagePlan: log?.packagePlan ?? 'No active plan',
        nodeVersion: log?.nodeVersion ?? 'System default',
        phpVersion: log?.phpVersion ?? 'System default',
        domain: log?.domain || getDeploymentUrl(log?.output),
        deploy_url: log?.domain || getDeploymentUrl(log?.output),
    }
})

const statusLabel = computed(() => {
    switch (selectedDeployment.value.status) {
        case 'success':
            return 'Ready'
        case 'running':
            return 'Running'
        case 'failed':
            return 'Failed'
        case 'cancelled':
            return 'Cancelled'
        default:
            return 'Unknown'
    }
})

const statusDotClass = computed(() => {
    switch (selectedDeployment.value.status) {
        case 'success':
            return 'bg-emerald-400'
        case 'running':
            return 'bg-yellow-400'
        case 'failed':
            return 'bg-red-400'
        case 'cancelled':
            return 'bg-neutral-400'
        default:
            return 'bg-neutral-400'
    }
})

const visibleLogs = computed(() =>
    logs.value.slice(0, visibleLogCount.value)
)

const hasMoreLogs = computed(() =>
    visibleLogCount.value < logs.value.length
)

onMounted(async () => {
    await getLogs()
    subscribeToDeploymentLogs()
    $socket.off('deployments:build-log')
    $socket.off('connect', subscribeToDeploymentLogs)
    $socket.on('deployments:build-log', handleBuildLogEvent)
    $socket.on('connect', subscribeToDeploymentLogs)
})

useIntersectionObserver(loadMoreTrigger, ([entry]) => {
    if (entry?.isIntersecting && hasMoreLogs.value) {
        visibleLogCount.value += logsPageSize
    }
}, {
    rootMargin: '240px',
})

onBeforeUnmount(() => {
    $socket.off('deployments:build-log', handleBuildLogEvent)
    $socket.off('connect', subscribeToDeploymentLogs)

    if (token.value) {
        $socket.emit('deployments:unsubscribe', {
            token: token.value,
        })
    }
})

watch(
    () => route.query.project,
    async () => {
        await getLogs(true)
    }
)

async function getLogs(silent = false) {
    const res: any = await api.get('/deployments/build-logs', undefined, !silent)
    const data: BuildLog[] = res.data || []

    logs.value = data
    visibleLogCount.value = logsPageSize
    selectLog(data)
}

function selectLog(data: BuildLog[]) {
    const projectId = Number(route.query.project)

    const projectLog = Number.isFinite(projectId)
        ? data.find((log) => log.id === projectId)
        : null

    if (projectLog) {
        selectedLog.value = projectLog
        return
    }

    if (Number.isFinite(projectId)) {
        selectedLog.value = createPendingLog(projectId)
        return
    }

    const selectedLogExists = data.some(
        (log) => log.id === selectedLog.value?.id
    )

    if (!selectedLog.value || !selectedLogExists) {
        selectedLog.value = data[0] || null
    }
}

function selectLogEntry(log: BuildLog) {
    selectedLog.value = log

    void navigateTo(
        {
            path: route.path,
            query: {
                ...route.query,
                project: String(log.id),
            },
        },
        {
            replace: true,
        }
    )
}

function subscribeToDeploymentLogs() {
    if (!token.value) return

    $socket.emit('deployments:subscribe', {
        token: token.value,
    })
}

function handleBuildLogEvent(payload: {
    type?: 'snapshot' | 'append'
    outputChunk?: string
    log?: Partial<BuildLog> & { id?: number }
}) {
    if (!payload?.log?.id) return

    const existingIndex = logs.value.findIndex((item) => item.id === payload.log?.id)
    const existing = existingIndex >= 0 ? logs.value[existingIndex] : null

    const nextLog: BuildLog = {
        id: payload.log.id,
        project: payload.log.project ?? existing?.project ?? `Project #${payload.log.id}`,
        branch: payload.log.branch ?? existing?.branch ?? '-',
        commit: payload.log.commit ?? existing?.commit ?? '-',
        status: payload.log.status ?? existing?.status ?? 'running',
        duration: payload.log.duration ?? existing?.duration ?? 'Starting',
        createdAt: payload.log.createdAt ?? existing?.createdAt ?? '-',
        installTime: payload.log.installTime ?? existing?.installTime ?? '-',
        buildTime: payload.log.buildTime ?? existing?.buildTime ?? '-',
        deployTime: payload.log.deployTime ?? existing?.deployTime ?? '-',
        output: payload.type === 'append'
            ? [existing?.output, payload.outputChunk].filter(Boolean).join('\n')
            : payload.log.output ?? existing?.output ?? '',
        packagePlan: payload.log.packagePlan ?? existing?.packagePlan ?? 'No active plan',
        nodeVersion: payload.log.nodeVersion ?? existing?.nodeVersion ?? 'System default',
        phpVersion: payload.log.phpVersion ?? existing?.phpVersion ?? 'System default',
        domain: payload.log.domain ?? existing?.domain ?? null,
    }

    if (existingIndex >= 0) {
        logs.value.splice(existingIndex, 1, nextLog)
    } else {
        logs.value.unshift(nextLog)
    }

    selectLog(logs.value)
}

function createPendingLog(projectId: number): BuildLog {
    return {
        id: projectId,
        project: `Project #${projectId}`,
        branch: '-',
        commit: 'Preparing deployment',
        status: 'running',
        duration: 'Starting',
        createdAt: '-',
        installTime: '-',
        buildTime: 'Running',
        deployTime: '-',
        output: PENDING_LOG_OUTPUT,
        packagePlan: 'No active plan',
        nodeVersion: 'System default',
        phpVersion: 'System default',
        domain: null,
    }
}

function getDeploymentUrl(output?: string) {
    if (!output) {
        return 'about:blank'
    }

    const match = output.match(/Deployment ready at (https?:\/\/[^\s]+)/)

    return match?.[1]?.replace(/\.$/, '') || 'about:blank'
}

function formatDateTime(value?: string) {
    if (!value || value === '-') {
        return '-'
    }

    return new Date(value).toLocaleString()
}

function getStatusColor(status: BuildStatus | string) {
    switch (status) {
        case 'success':
            return 'success'
        case 'running':
            return 'warning'
        case 'failed':
            return 'error'
        case 'cancelled':
            return 'neutral'
        default:
            return 'neutral'
    }
}
</script>
