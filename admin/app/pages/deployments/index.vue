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
                <UButton icon="i-lucide-git-branch" color="neutral" variant="soft" to="/deployments/git">
                    Git Repository
                </UButton>

                <UButton icon="i-lucide-rocket">
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
                <div v-for="app in filteredDeployments" :key="app.id" class="rounded-2xl border border-default p-4">
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
                            <UButton icon="i-lucide-rocket" size="sm" :loading="app.status === 'deploying'">
                                Deploy
                            </UButton>

                            <UButton icon="i-lucide-scroll-text" size="sm" color="neutral" variant="soft"
                                to="/deployments/build-logs">
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
                            <p class="mt-1 text-sm font-medium text-highlighted">{{ app.domain }}</p>
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
            </div>
        </UCard>
        <DeploymentDetailsModal v-model:open="detailOpen" :project="detailProject" @deploy="deployProject"
            @rollback="rollbackProject" />

        <DeploymentSettingsModal v-model:open="settingOpen" :project="selectedProject" @submit="updateProjectSettings"
            @delete="deleteProject" />
    </div>
</template>

<script lang="ts" setup>
import DeploymentDetailsModal from '~/components/deployments/DeploymentDetailsModal.vue'
import DeploymentSettingsModal from '~/components/deployments/DeploymentSettingsModal.vue'

definePageMeta({
    middleware: "alc",
    moduleKey: moduleKey.DEPLOY,
})

type DeployStatus = "success" | "deploying" | "failed" | "pending"

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

const search = ref("")
const status = ref("all")

const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Success", value: "success" },
    { label: "Deploying", value: "deploying" },
    { label: "Failed", value: "failed" },
    { label: "Pending", value: "pending" },
]

const stats = [
    {
        label: "Total Projects",
        value: "12",
        icon: "i-lucide-folder-git-2",
    },
    {
        label: "Successful",
        value: "9",
        icon: "i-lucide-circle-check",
    },
    {
        label: "Deploying",
        value: "2",
        icon: "i-lucide-loader",
    },
    {
        label: "Failed",
        value: "1",
        icon: "i-lucide-circle-x",
    },
]

const deployments = ref<Deployment[]>([
    {
        id: 1,
        name: "lcpanel-admin",
        description: "Nuxt admin dashboard for managing hosting services.",
        framework: "Nuxt",
        branch: "main",
        environment: "Production",
        domain: "panel.ltech.digital",
        commit: "a82f13c",
        lastDeploy: "2 minutes ago",
        buildTime: "1m 24s",
        status: "success",
        icon: "i-simple-icons-nuxtdotjs",
    },
    {
        id: 2,
        name: "lcpanel-core",
        description: "NestJS API service with Prisma, PM2, and server control.",
        framework: "NestJS",
        branch: "main",
        environment: "Production",
        domain: "api.ltech.digital",
        commit: "f91b22a",
        lastDeploy: "Deploying now",
        buildTime: "Running",
        status: "deploying",
        icon: "i-simple-icons-nestjs",
    },
    {
        id: 3,
        name: "client-website",
        description: "Laravel website hosted with PHP and Nginx.",
        framework: "Laravel",
        branch: "production",
        environment: "Production",
        domain: "client.com",
        commit: "c34e901",
        lastDeploy: "1 hour ago",
        buildTime: "42s",
        status: "failed",
        icon: "i-simple-icons-laravel",
    },
])

const settingOpen = ref(false)
const selectedProject = ref<Deployment | null>(null)
const detailOpen = ref(false)
const detailProject = ref<Deployment | null>(null)

function openSettings(app: Deployment) {
    selectedProject.value = app
    settingOpen.value = true
}

function updateProjectSettings(payload: any) {
    console.log("save settings", payload)
}

function deleteProject(project: Deployment) {
    deployments.value = deployments.value.filter((item) => item.id !== project.id)
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

function deployProject(project: Deployment) {
    console.log('deploy project', project)
}

function rollbackProject(project: Deployment) {
    console.log('rollback project', project)
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