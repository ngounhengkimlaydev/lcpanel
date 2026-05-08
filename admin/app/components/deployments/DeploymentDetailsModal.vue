<template>
    <UModal v-model:open="open" :ui="{
        content: 'w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-2xl bg-default shadow-xl ring ring-default'
    }">
        <template #content>
            <div class="flex max-h-[80dvh] flex-col overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-default px-6 py-4">
                    <div class="flex min-w-0 items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon :name="project?.icon || 'i-lucide-rocket'" class="size-5" />
                        </div>

                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 class="truncate text-lg font-bold text-highlighted">
                                    {{ project?.name || 'Deployment Details' }}
                                </h3>

                                <UBadge v-if="project" :color="getStatusColor(project.status)" variant="soft"
                                    class="capitalize">
                                    {{ project.status }}
                                </UBadge>
                            </div>

                            <p class="truncate text-sm text-muted">
                                {{ project?.description || 'View deployment information.' }}
                            </p>
                        </div>
                    </div>

                    <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="open = false" />
                </div>

                <div v-if="project" class="grid max-h-[80dvh] grid-cols-1 overflow-hidden lg:grid-cols-[1fr_320px]">
                    <!-- Main Content -->
                    <div class="min-h-0 overflow-y-auto p-6">
                        <div class="space-y-6">
                            <!-- Preview -->
                            <section class="overflow-hidden rounded-2xl border border-default">
                                <div class="border-b border-default px-5 py-4">
                                    <h4 class="font-bold text-highlighted">Deployment Preview</h4>
                                    <p class="mt-1 text-sm text-muted">
                                        Current production deployment information.
                                    </p>
                                </div>

                                <div class="p-5">
                                    <div class="rounded-xl border border-default bg-muted/20 p-5">
                                        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p class="text-sm text-muted">Production Domain</p>
                                                <p class="mt-1 font-semibold text-highlighted">
                                                    {{ project.domain }}
                                                </p>
                                            </div>

                                            <div class="flex gap-2">
                                                <UButton icon="i-lucide-external-link" color="neutral" variant="soft"
                                                    size="sm" :to="`https://${project.domain}`" target="_blank">
                                                    Visit
                                                </UButton>

                                                <UButton icon="i-lucide-copy" color="neutral" variant="soft" size="sm"
                                                    @click="copyDomain">
                                                    Copy
                                                </UButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Deployment Info -->
                            <section class="overflow-hidden rounded-2xl border border-default">
                                <div class="border-b border-default px-5 py-4">
                                    <h4 class="font-bold text-highlighted">Deployment Information</h4>
                                    <p class="mt-1 text-sm text-muted">
                                        Framework, environment, commit, and build details.
                                    </p>
                                </div>

                                <div
                                    class="grid grid-cols-1 divide-y divide-default md:grid-cols-2 md:divide-x md:divide-y-0">
                                    <div class="space-y-4 p-5">
                                        <InfoRow label="Framework" :value="project.framework" />
                                        <InfoRow label="Environment" :value="project.environment" />
                                        <InfoRow label="Branch" :value="project.branch" />
                                    </div>

                                    <div class="space-y-4 p-5">
                                        <InfoRow label="Last Commit" :value="project.commit" />
                                        <InfoRow label="Last Deploy" :value="project.lastDeploy" />
                                        <InfoRow label="Build Time" :value="project.buildTime" />
                                    </div>
                                </div>
                            </section>

                            <!-- Build Timeline -->
                            <section class="overflow-hidden rounded-2xl border border-default">
                                <div class="border-b border-default px-5 py-4">
                                    <h4 class="font-bold text-highlighted">Build Timeline</h4>
                                    <p class="mt-1 text-sm text-muted">
                                        Latest deployment process.
                                    </p>
                                </div>

                                <div class="space-y-4 p-5">
                                    <div v-for="item in timeline" :key="item.label" class="flex gap-3">
                                        <div class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
                                            :class="item.done ? 'bg-success/10 text-success' : 'bg-muted text-muted'">
                                            <UIcon :name="item.icon" class="size-4" />
                                        </div>

                                        <div>
                                            <p class="font-medium text-highlighted">
                                                {{ item.label }}
                                            </p>
                                            <p class="text-sm text-muted">
                                                {{ item.description }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <!-- Right Summary -->
                    <aside class="border-t border-default bg-muted/20 p-6 lg:border-l lg:border-t-0">
                        <div class="space-y-6">
                            <div>
                                <p class="text-xs font-medium uppercase text-muted">
                                    Status
                                </p>

                                <div class="mt-2 flex items-center gap-2">
                                    <span class="size-2 rounded-full" :class="getStatusDot(project.status)" />

                                    <p class="font-semibold capitalize text-highlighted">
                                        {{ project.status }}
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <SummaryItem label="Project" :value="project.name" />
                                <SummaryItem label="Domain" :value="project.domain" />
                                <SummaryItem label="Commit" :value="project.commit" />
                                <SummaryItem label="Branch" :value="project.branch" />
                            </div>

                            <div class="space-y-2">
                                <UButton icon="i-lucide-rocket" block :loading="project.status === 'deploying'"
                                    @click="emit('deploy', project)">
                                    Redeploy
                                </UButton>

                                <UButton icon="i-lucide-scroll-text" color="neutral" variant="soft" block
                                    to="/deployments/build-logs">
                                    View Build Logs
                                </UButton>

                                <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="soft" block
                                    :disabled="project.status === 'deploying'" @click="emit('rollback', project)">
                                    Rollback
                                </UButton>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
type DeployStatus = 'success' | 'deploying' | 'failed' | 'pending'

interface Deployment {
    id: number
    name: string
    description: string
    framework: string
    branch: string
    environment: string
    domain: string
    commit: string
    lastDeploy: string
    buildTime: string
    status: DeployStatus
    icon: string
}

const props = defineProps<{
    project: Deployment | null
}>()

const emit = defineEmits<{
    deploy: [project: Deployment]
    rollback: [project: Deployment]
}>()

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()

const timeline = computed(() => {
    const isFailed = props.project?.status === 'failed'
    const isDeploying = props.project?.status === 'deploying'
    const isPending = props.project?.status === 'pending'

    return [
        {
            label: 'Repository Connected',
            description: 'Git repository and production branch are ready.',
            icon: 'i-lucide-git-branch',
            done: true,
        },
        {
            label: 'Build Started',
            description: isPending ? 'Waiting for deployment to start.' : 'Install and build command started.',
            icon: 'i-lucide-terminal',
            done: !isPending,
        },
        {
            label: isFailed ? 'Build Failed' : isDeploying ? 'Deploying' : 'Deployment Ready',
            description: isFailed
                ? 'The latest deployment failed. Check build logs for details.'
                : isDeploying
                    ? 'Deployment is currently running.'
                    : 'Deployment completed successfully.',
            icon: isFailed
                ? 'i-lucide-circle-x'
                : isDeploying
                    ? 'i-lucide-loader'
                    : 'i-lucide-circle-check',
            done: !isPending,
        },
    ]
})

function getStatusColor(status: DeployStatus) {
    switch (status) {
        case 'success':
            return 'success'
        case 'deploying':
            return 'warning'
        case 'failed':
            return 'error'
        case 'pending':
            return 'neutral'
        default:
            return 'neutral'
    }
}

function getStatusDot(status: DeployStatus) {
    switch (status) {
        case 'success':
            return 'bg-success'
        case 'deploying':
            return 'bg-warning'
        case 'failed':
            return 'bg-error'
        case 'pending':
            return 'bg-muted'
        default:
            return 'bg-muted'
    }
}

async function copyDomain() {
    if (!props.project) return

    await navigator.clipboard.writeText(props.project.domain)

    toast.add({
        title: 'Copied',
        description: 'Domain copied to clipboard.',
        color: 'success',
    })
}
</script>