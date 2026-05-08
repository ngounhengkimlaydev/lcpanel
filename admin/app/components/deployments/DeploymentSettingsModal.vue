<template>
    <UModal v-model:open="open" fullscreen>
        <template #content>
            <div class="flex h-dvh flex-col bg-default text-default">
                <!-- Top Bar -->
                <header class="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-default px-4">
                    <div class="flex min-w-0 items-center gap-3">
                        <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" @click="open = false" />

                        <div class="hidden min-w-0 items-center gap-2 sm:flex">
                            <div class="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <UIcon name="i-lucide-rocket" class="size-4" />
                            </div>

                            <p class="truncate text-sm font-semibold text-highlighted">
                                {{ form.name || project?.name || 'Project' }}
                            </p>

                            <UIcon name="i-lucide-chevron-down" class="size-4 text-muted" />
                        </div>
                    </div>

                    <h2 class="text-sm font-semibold text-highlighted">
                        Project Settings
                    </h2>

                    <div class="flex justify-end">
                        <UDropdownMenu :items="headerActions">
                            <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" size="sm" />
                        </UDropdownMenu>
                    </div>
                </header>

                <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[296px_1fr]">
                    <!-- Sidebar -->
                    <aside class="hidden min-h-0 border-r border-default bg-default lg:flex lg:flex-col">
                        <div class="border-b border-default p-4">
                            <UInput v-model="menuSearch" icon="i-lucide-search" placeholder="Find..." size="md" :ui="{
                                root: 'w-full',
                                base: 'bg-muted/40'
                            }">
                                <template #trailing>
                                    <UKbd value="F" />
                                </template>
                            </UInput>
                        </div>

                        <div class="min-h-0 flex-1 overflow-y-auto p-3">
                            <nav class="space-y-1">
                                <button v-for="item in filteredTabs" :key="item.key" type="button"
                                    class="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition"
                                    :class="activeTab === item.key
                                        ? 'bg-muted text-highlighted'
                                        : 'text-muted hover:bg-muted/60 hover:text-highlighted'
                                        " @click="activeTab = item.key">
                                    {{ item.label }}
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <!-- Mobile Tabs -->
                    <div class="border-b border-default p-3 lg:hidden">
                        <USelect v-model="activeTab" :items="mobileTabOptions" class="w-full" />
                    </div>

                    <!-- Main -->
                    <main class="min-h-0 overflow-y-auto">
                        <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                            <!-- General -->
                            <div v-if="activeTab === 'general'" class="space-y-6">
                                <!-- Project Name -->
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Project Name
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Used to identify your Project on the Dashboard, CLI, and in deployment
                                                URLs.
                                            </p>
                                        </div>

                                        <div class="flex overflow-hidden rounded-lg border border-default">
                                            <div
                                                class="hidden shrink-0 items-center border-r border-default bg-muted/30 px-4 text-sm text-muted md:flex">
                                                {{ domainPrefix }}
                                            </div>

                                            <UInput v-model="form.name" variant="none" placeholder="website-taskio" :ui="{
                                                root: 'w-full',
                                                base: 'h-12 px-4 font-medium'
                                            }" />
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between border-t border-default px-6 py-4">
                                        <p class="text-sm text-muted">
                                            Learn more about
                                            <ULink class="text-primary" to="#">
                                                Project Name
                                            </ULink>
                                        </p>

                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>

                                <!-- Project ID -->
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Project ID
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Used when interacting with your API.
                                            </p>
                                        </div>

                                        <div
                                            class="flex w-full max-w-md items-center overflow-hidden rounded-lg border border-default">
                                            <code class="flex-1 truncate px-4 py-3 text-sm text-highlighted">
                            {{ form.projectId }}
                        </code>

                                            <UButton icon="i-lucide-copy" color="neutral" variant="ghost"
                                                @click="copyProjectId" />
                                        </div>
                                    </div>

                                    <div class="border-t border-default px-6 py-4">
                                        <p class="text-sm text-muted">
                                            Learn more about
                                            <ULink class="text-primary" to="#">
                                                Project ID
                                            </ULink>
                                        </p>
                                    </div>
                                </section>

                                <!-- Toolbar -->
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Deployment Toolbar
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Enable the deployment toolbar on your deployments.
                                            </p>
                                        </div>

                                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <UFormField label="Pre-Production Deployments">
                                                <USelect v-model="form.preProductionToolbar" :items="toolbarOptions" />
                                            </UFormField>

                                            <UFormField label="Production Deployments">
                                                <USelect v-model="form.productionToolbar" :items="toolbarOptions" />
                                            </UFormField>
                                        </div>
                                    </div>

                                    <div class="flex justify-end border-t border-default px-6 py-4">
                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>
                            </div>

                            <!-- Build -->
                            <div v-if="activeTab === 'build'" class="space-y-6">
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Build and Deployment
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Configure framework preset, install command, build command, and output
                                                directory.
                                            </p>
                                        </div>

                                        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <UFormField label="Framework Preset">
                                                <USelect v-model="form.framework" :items="frameworkOptions" />
                                            </UFormField>

                                            <UFormField label="Root Directory">
                                                <UInput v-model="form.rootDir" placeholder="./" />
                                            </UFormField>

                                            <UFormField label="Install Command">
                                                <UInput v-model="form.installCommand" placeholder="pnpm install" />
                                            </UFormField>

                                            <UFormField label="Build Command">
                                                <UInput v-model="form.buildCommand" placeholder="pnpm build" />
                                            </UFormField>

                                            <UFormField label="Output Directory">
                                                <UInput v-model="form.outputDir" placeholder=".output/public" />
                                            </UFormField>

                                            <UFormField label="Node Version">
                                                <UInput v-model="form.nodeVersion" placeholder="24" />
                                            </UFormField>
                                        </div>
                                    </div>

                                    <div class="flex justify-end border-t border-default px-6 py-4">
                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>
                            </div>

                            <!-- Environments -->
                            <div v-if="activeTab === 'environment'" class="space-y-6">
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h3 class="text-xl font-bold text-highlighted">
                                                    Environment Variables
                                                </h3>
                                                <p class="mt-4 text-sm text-toned">
                                                    Store secrets and runtime configuration for your deployments.
                                                </p>
                                            </div>

                                            <UButton icon="i-lucide-plus" color="neutral" variant="soft" size="sm"
                                                @click="addEnv">
                                                Add
                                            </UButton>
                                        </div>

                                        <div class="space-y-3">
                                            <div v-for="(env, index) in form.envs" :key="index"
                                                class="grid grid-cols-1 gap-3 rounded-lg border border-default p-3 md:grid-cols-[1fr_1fr_auto]">
                                                <UInput v-model="env.key" placeholder="KEY" />
                                                <UInput v-model="env.value" placeholder="VALUE" type="password" />

                                                <UButton icon="i-lucide-trash" color="error" variant="ghost"
                                                    @click="removeEnv(index)" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex justify-end border-t border-default px-6 py-4">
                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>
                            </div>

                            <!-- Git -->
                            <div v-if="activeTab === 'git'" class="space-y-6">
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Git
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Manage repository, production branch, and automatic deployments.
                                            </p>
                                        </div>

                                        <div class="space-y-5">
                                            <UFormField label="Repository">
                                                <UInput v-model="form.repository" placeholder="lay/lcpanel-admin" />
                                            </UFormField>

                                            <UFormField label="Production Branch">
                                                <UInput v-model="form.branch" placeholder="main" />
                                            </UFormField>

                                            <div
                                                class="flex items-center justify-between rounded-lg border border-default p-4">
                                                <div>
                                                    <p class="font-medium text-highlighted">
                                                        Auto Deploy
                                                    </p>
                                                    <p class="mt-1 text-sm text-muted">
                                                        Deploy automatically when pushing to the production branch.
                                                    </p>
                                                </div>

                                                <USwitch v-model="form.autoDeploy" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex justify-end border-t border-default px-6 py-4">
                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>
                            </div>

                            <!-- Deployment Protection -->
                            <div v-if="activeTab === 'protection'" class="space-y-6">
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Deployment Protection
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Control who can access preview and production deployments.
                                            </p>
                                        </div>

                                        <div class="space-y-3">
                                            <div
                                                class="flex items-center justify-between rounded-lg border border-default p-4">
                                                <div>
                                                    <p class="font-medium text-highlighted">
                                                        Password Protection
                                                    </p>
                                                    <p class="mt-1 text-sm text-muted">
                                                        Require a password before accessing preview deployments.
                                                    </p>
                                                </div>

                                                <USwitch v-model="form.passwordProtection" />
                                            </div>

                                            <div
                                                class="flex items-center justify-between rounded-lg border border-default p-4">
                                                <div>
                                                    <p class="font-medium text-highlighted">
                                                        Team Access Only
                                                    </p>
                                                    <p class="mt-1 text-sm text-muted">
                                                        Only project members can access private deployments.
                                                    </p>
                                                </div>

                                                <USwitch v-model="form.teamAccessOnly" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex justify-end border-t border-default px-6 py-4">
                                        <UButton size="sm" @click="submit">
                                            Save
                                        </UButton>
                                    </div>
                                </section>
                            </div>

                            <!-- Advanced -->
                            <div v-if="activeTab === 'advanced'" class="space-y-6">
                                <section class="overflow-hidden rounded-xl border border-default bg-default">
                                    <div class="space-y-5 p-6">
                                        <div>
                                            <h3 class="text-xl font-bold text-highlighted">
                                                Advanced
                                            </h3>
                                            <p class="mt-4 text-sm text-toned">
                                                Advanced project configuration and destructive actions.
                                            </p>
                                        </div>

                                        <div class="rounded-xl border border-error/40 bg-error/5">
                                            <div class="p-5">
                                                <h4 class="font-semibold text-error">
                                                    Delete Project
                                                </h4>
                                                <p class="mt-2 text-sm text-muted">
                                                    This will remove deployments, logs, domains, and environment
                                                    variables.
                                                </p>
                                            </div>

                                            <div class="flex justify-end border-t border-error/20 px-5 py-4">
                                                <UButton icon="i-lucide-trash-2" color="error" @click="emitDelete">
                                                    Delete Project
                                                </UButton>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
type TabKey =
    | 'general'
    | 'build'
    | 'environment'
    | 'git'
    | 'protection'
    | 'advanced'

interface Deployment {
    id: number
    name: string
    domain: string
    framework?: string
    branch?: string
}

interface EnvItem {
    key: string
    value: string
}

const props = defineProps<{
    project: Deployment | null
}>()

const emit = defineEmits<{
    submit: [value: any]
    delete: [project: Deployment]
}>()

const toast = useToast()

const open = defineModel<boolean>('open', { default: false })

const activeTab = ref<TabKey>('general')
const menuSearch = ref('')

const tabs = [
    {
        key: 'general',
        label: 'General',
    },
    {
        key: 'build',
        label: 'Build and Deployment',
    },
    {
        key: 'environment',
        label: 'Environments',
    },
    {
        key: 'git',
        label: 'Git',
    },
    {
        key: 'protection',
        label: 'Deployment Protection',
    },
    {
        key: 'advanced',
        label: 'Advanced',
    },
] satisfies {
    key: TabKey
    label: string
}[]

const mobileTabOptions = tabs.map((item) => ({
    label: item.label,
    value: item.key,
}))

const filteredTabs = computed(() => {
    const keyword = menuSearch.value.toLowerCase().trim()

    if (!keyword) return tabs

    return tabs.filter((item) => item.label.toLowerCase().includes(keyword))
})

const headerActions = computed(() => [
    [
        {
            label: 'View Deployments',
            icon: 'i-lucide-rocket',
            to: '/deployments',
        },
        {
            label: 'View Build Logs',
            icon: 'i-lucide-scroll-text',
            to: '/deployments/build-logs',
        },
    ],
    [
        {
            label: 'Delete Project',
            icon: 'i-lucide-trash-2',
            color: 'error' as const,
            onSelect: emitDelete,
        },
    ],
])

const frameworkOptions = [
    { label: 'Nuxt', value: 'Nuxt' },
    { label: 'Next.js', value: 'Next.js' },
    { label: 'Laravel', value: 'Laravel' },
    { label: 'NestJS', value: 'NestJS' },
    { label: 'Static', value: 'Static' },
]

const toolbarOptions = [
    {
        label: 'Default (controlled at the team level)',
        value: 'default',
    },
    {
        label: 'Enabled',
        value: 'enabled',
    },
    {
        label: 'Disabled',
        value: 'disabled',
    },
]

const form = reactive({
    name: '',
    domain: '',
    projectId: '',
    framework: 'Nuxt',
    rootDir: './',
    installCommand: 'pnpm install',
    buildCommand: 'pnpm build',
    outputDir: '.output/public',
    nodeVersion: '24',
    repository: '',
    branch: 'main',
    autoDeploy: true,
    preProductionToolbar: 'default',
    productionToolbar: 'default',
    passwordProtection: false,
    teamAccessOnly: false,
    envs: [{ key: 'NODE_ENV', value: 'production' }] as EnvItem[],
})

const domainPrefix = computed(() => {
    return `lcpanel.com/${form.name ? 'projects' : 'new'}/`
})

watch(
    () => open.value,
    (value) => {
        if (!value || !props.project) return

        activeTab.value = 'general'

        form.name = props.project.name
        form.domain = props.project.domain
        form.projectId = `prj_${Math.random().toString(36).slice(2, 22)}`
        form.framework = props.project.framework || 'Nuxt'
        form.rootDir = './'
        form.installCommand = 'pnpm install'
        form.buildCommand = 'pnpm build'
        form.outputDir = '.output/public'
        form.nodeVersion = '24'
        form.repository = `lay/${props.project.name}`
        form.branch = props.project.branch || 'main'
        form.autoDeploy = true
        form.preProductionToolbar = 'default'
        form.productionToolbar = 'default'
        form.passwordProtection = false
        form.teamAccessOnly = false
        form.envs = [{ key: 'NODE_ENV', value: 'production' }]
    }
)

async function copyProjectId() {
    await navigator.clipboard.writeText(form.projectId)

    toast.add({
        title: 'Copied',
        description: 'Project ID copied to clipboard.',
        color: 'success',
    })
}

function addEnv() {
    form.envs.push({
        key: '',
        value: '',
    })
}

function removeEnv(index: number) {
    form.envs.splice(index, 1)
}

function submit() {
    emit('submit', {
        project_id: props.project?.id,
        ...form,
        envs: [...form.envs],
    })

    toast.add({
        title: 'Settings saved',
        description: 'Project settings have been updated.',
        color: 'success',
    })
}

function emitDelete() {
    if (!props.project) return

    emit('delete', props.project)
    open.value = false
}
</script>