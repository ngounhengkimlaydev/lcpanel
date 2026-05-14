<template>
    <div class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-highlighted">Deployments</h1>
                <p class="mt-1 text-sm text-muted">
                    Manage imported projects, deploy new versions, rollback, and view build status.
                </p>
            </div>

            <div class="flex gap-2">
                <UButton icon="i-lucide-refresh-ccw" color="neutral" variant="soft" @click="getDeployments()">
                    Refresh
                </UButton>

                <UButton icon="i-lucide-rocket" to="/deployments/git">
                    New Deploy
                </UButton>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UCard v-for="stat in stats" :key="stat.label">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <p class="text-sm text-muted">{{ stat.label }}</p>
                        <p class="mt-1 text-2xl font-bold text-highlighted">{{ stat.value }}</p>
                    </div>

                    <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UIcon :name="stat.icon" class="size-5" />
                    </div>
                </div>
            </UCard>
        </div>

        <UCard>
            <template #header>
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-lg font-bold text-highlighted">Project Deployments</h2>
                        <p class="text-sm text-muted">
                            Deploy, monitor, and rollback your imported applications.
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 sm:flex-row">
                        <UInput v-model="search" icon="i-lucide-search" placeholder="Search project..."
                            class="w-full sm:w-72" />

                        <USelect v-model="status" :items="statusOptions" placeholder="Status" class="w-full sm:w-40" />
                    </div>
                </div>
            </template>

            <div class="space-y-4">
                <div v-if="!loading" v-for="app in visibleDeployments" :key="app.id"
                    class="rounded-2xl border border-default p-4">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex items-start gap-4">
                            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UIcon :name="app.icon" class="size-6" />
                            </div>

                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="font-bold text-highlighted">{{ app.name }}</h3>

                                    <UBadge :color="getStatusColor(app.status)" variant="soft">
                                        {{ app.status }}
                                    </UBadge>
                                </div>

                                <p class="mt-1 text-sm text-muted">{{ app.description }}</p>

                                <div class="mt-3 flex flex-wrap gap-2">
                                    <UBadge color="neutral" variant="soft">
                                        {{ app.framework }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        {{ app.branch }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        {{ app.environment }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 lg:justify-end">
                            <UButton icon="i-lucide-rocket" size="sm" :loading="app.status === 'deploying'"
                                @click="deployProject(app)">
                                Deploy
                            </UButton>

                            <UButton icon="i-lucide-scroll-text" size="sm" color="neutral" variant="soft"
                                :to="{ path: '/deployments/build-logs', query: { project: String(app.id) } }">
                                Logs
                            </UButton>

                            <UDropdownMenu :items="getActions(app)">
                                <UButton icon="i-lucide-more-horizontal" size="sm" color="neutral" variant="ghost" />
                            </UDropdownMenu>
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-4 md:grid-cols-4">
                        <div>
                            <p class="text-xs text-muted">Domain</p>
                            <p class="mt-1 text-sm font-medium  text-blue-500 hover:underline">
                                <NuxtLink :to="app.domain">
                                    {{ app.domain }}
                                </NuxtLink>
                            </p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Last Commit</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ app.commit }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Last Deploy</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ app.lastDeploy }}</p>
                        </div>

                        <div>
                            <p class="text-xs text-muted">Build Time</p>
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ app.buildTime }}</p>
                        </div>
                    </div>
                </div>
                <div class="rounded-2xl border border-default p-4" v-else v-for="index in 2">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex items-start gap-4">
                            <USkeleton class="size-12 rounded-xl" />

                            <div class="flex-1 space-y-3">
                                <div class="flex flex-wrap items-center gap-2">
                                    <USkeleton class="h-5 w-32" />
                                    <USkeleton class="h-5 w-20 rounded-full" />
                                </div>

                                <USkeleton class="h-4 w-64 max-w-full" />

                                <div class="flex flex-wrap gap-2">
                                    <USkeleton class="h-5 w-20 rounded-full" />
                                    <USkeleton class="h-5 w-16 rounded-full" />
                                    <USkeleton class="h-5 w-24 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 lg:justify-end">
                            <USkeleton class="h-8 w-24 rounded-md" />
                            <USkeleton class="h-8 w-20 rounded-md" />
                            <USkeleton class="h-8 w-8 rounded-md" />
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-4 md:grid-cols-4">
                        <div class="space-y-2">
                            <USkeleton class="h-3 w-16" />
                            <USkeleton class="h-4 w-36" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-20" />
                            <USkeleton class="h-4 w-24" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-20" />
                            <USkeleton class="h-4 w-28" />
                        </div>

                        <div class="space-y-2">
                            <USkeleton class="h-3 w-18" />
                            <USkeleton class="h-4 w-20" />
                        </div>
                    </div>
                </div>

                <div v-if="!filteredDeployments.length"
                    class="rounded-2xl border border-dashed border-default p-10 text-center">
                    <UIcon name="i-lucide-rocket" class="mx-auto mb-3 size-10 text-muted" />
                    <p class="font-medium text-highlighted">No deployments found</p>
                    <p class="mt-1 text-sm text-muted">
                        Connect a Git repository first, then import your project.
                    </p>

                    <UButton to="/deployments/git" icon="i-lucide-git-branch" class="mt-4">
                        Connect Git Repository
                    </UButton>
                </div>

                <div
                    v-if="hasMoreDeployments"
                    ref="loadMoreTrigger"
                    class="h-1"
                />
            </div>
        </UCard>
        <DeploymentDetailsModal v-model:open="detailOpen" :project="detailProject" @deploy="deployProject"
            @rollback="rollbackProject" />

        <DeploymentSettingsModal v-model:open="settingOpen" :project="selectedProject" @submit="updateProjectSettings"
            @delete="(project) => deleteProject(project as Deployment)" />
    </div>
</template>

<script lang="ts" setup>
import DeploymentDetailsModal from '~/components/deployments/DeploymentDetailsModal.vue'
import DeploymentSettingsModal from '~/components/deployments/DeploymentSettingsModal.vue'
import type { Deployment, DeployStatus } from '~/types/deployments'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.DEPLOY,
})

const search = ref("")
const status = ref("all")

const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Success", value: "success" },
    { label: "Deploying", value: "deploying" },
    { label: "Failed", value: "failed" },
    { label: "Pending", value: "pending" },
]

const api = useApiFetch()
const toast = useToast()

const stats = ref([
    {
        label: "Total Projects",
        value: "0",
        icon: "i-lucide-folder-git-2",
    },
    {
        label: "Successful",
        value: "0",
        icon: "i-lucide-circle-check",
    },
    {
        label: "Deploying",
        value: "0",
        icon: "i-lucide-loader",
    },
    {
        label: "Failed",
        value: "0",
        icon: "i-lucide-circle-x",
    },
])

const deployments = ref<Deployment[]>([])
const deploymentPageSize = 8
const visibleDeploymentCount = ref(deploymentPageSize)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const settingOpen = ref(false)
const selectedProject = ref<Deployment | null>(null)
const detailOpen = ref(false)
const detailProject = ref<Deployment | null>(null)
const loading = ref<boolean>(false)

function openSettings(app: Deployment) {
    selectedProject.value = app
    settingOpen.value = true
}

onMounted(getDeployments)

watch([search, status], () => {
    visibleDeploymentCount.value = deploymentPageSize
})

useIntersectionObserver(loadMoreTrigger, ([entry]) => {
    if (entry?.isIntersecting && hasMoreDeployments.value) {
        visibleDeploymentCount.value += deploymentPageSize
    }
}, {
    rootMargin: '240px',
})

async function getDeployments() {
    loading.value = true
    try {
        const res: any = await api.get('/deployments')
        deployments.value = res.data || []
        stats.value = res.stats || stats.value
        visibleDeploymentCount.value = deploymentPageSize
    } catch (e) { } finally {
        loading.value = false
    }

}

async function updateProjectSettings(payload: any) {
    toast.add({
        title: 'Settings saved',
        description: payload?.name ? `${payload.name} settings updated.` : undefined,
        color: 'success',
    })
}

async function deleteProject(project: Deployment) {
    await api.delete(`/deployments/projects/${project.id}`)

    toast.add({
        title: 'Deployment deleted',
        color: 'success',
    })

    await getDeployments()
}

function getActions(app: Deployment) {
    return [
        [
            {
                label: "View Details",
                icon: "i-lucide-eye",
                onSelect: () => openDetails(app),
            },
            {
                label: "View Git History",
                icon: "i-lucide-history",
                to: "/deployments/history",
            },
        ],
        [
            {
                label: "Rollback",
                icon: "i-lucide-rotate-ccw",
                disabled: app.status === "deploying",
                onSelect: () => rollbackProject(app),
            },
            {
                label: "Settings",
                icon: "i-lucide-settings",
                onSelect: () => openSettings(app),
            },
        ],
    ]
}
function openDetails(app: Deployment) {
    detailProject.value = app
    detailOpen.value = true
}

async function deployProject(project: Deployment) {
    await api.post(`/deployments/projects/${project.id}/pull`, {
        install: true,
        build: true,
        restart: true,
    })

    toast.add({
        title: 'Deployment started',
        color: 'success',
    })

    await navigateTo({
        path: '/deployments/build-logs',
        query: { project: String(project.id) },
    })
}

function rollbackProject(project: Deployment) {
    toast.add({
        title: 'Rollback is not available yet',
        description: `${project.name} does not have stored rollback versions yet.`,
        color: 'neutral',
    })
}
const filteredDeployments = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    return deployments.value.filter((app) => {
        const matchSearch =
            !keyword ||
            [app.name, app.description, app.framework, app.branch, app.domain]
                .join(" ")
                .toLowerCase()
                .includes(keyword)

        const matchStatus = status.value === "all" || app.status === status.value

        return matchSearch && matchStatus
    })
})

const visibleDeployments = computed(() =>
    filteredDeployments.value.slice(0, visibleDeploymentCount.value)
)

const hasMoreDeployments = computed(() =>
    visibleDeploymentCount.value < filteredDeployments.value.length
)

function getStatusColor(status: DeployStatus) {
    switch (status) {
        case "success":
            return "success"
        case "deploying":
            return "warning"
        case "failed":
            return "error"
        case "pending":
            return "neutral"
        default:
            return "neutral"
    }
}

</script>
