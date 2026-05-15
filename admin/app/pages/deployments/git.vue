<template>
  <div class="space-y-6">
    <GitPageHeader @refresh="refreshRepositories" />

    <GitProviderCards
      :providers="providers"
      @connect="connectProvider"
    />

    <GitImportProjectCard
      v-model:search="search"
      v-model:selected-repo="selectedRepo"
      :repositories="repositories"
      :filtered-repositories="filteredRepositories"
      :visible-repositories="visibleRepositories"
      :has-more-repositories="hasMoreRepositories"
      :form="form"
      :branch-options="branchOptions"
      :framework-options="frameworkOptions"
      :submitting="isImporting"
      @cancel="cancelImport"
      @deploy="deployProject"
      @load-more="loadMoreRepositories"
    />
  </div>
</template>

<script lang="ts" setup>
import GitImportProjectCard from "~/components/deployments/git/GitImportProjectCard.vue"
import GitPageHeader from "~/components/deployments/git/GitPageHeader.vue"
import GitProviderCards from "~/components/deployments/git/GitProviderCards.vue"
import type {
  GitImportForm,
  GitProvider,
  GitRepository,
} from "~/types/git"

definePageMeta({
  middleware: "alc",
  moduleKey: moduleKey.GIT_REPO,
})

const toast = useToast()
const route = useRoute()
const api = useApiFetch()

const search = ref("")

const providers = ref<GitProvider[]>([
  {
    key: "github",
    name: "GitHub",
    icon: "i-simple-icons-github",
    description: "Import public or private repositories from GitHub.",
    connected: false,
  },
  // {
  //   key: "gitlab",
  //   name: "GitLab",
  //   icon: "i-simple-icons-gitlab",
  //   description: "Connect your GitLab account or self-hosted GitLab.",
  //   connected: false,
  // },
  {
    key: "manual",
    name: "Manual Git URL",
    icon: "i-lucide-git-branch-plus",
    description: "Import using HTTPS or SSH Git repository URL.",
    connected: false,
  },
])

const repositories = ref<GitRepository[]>([])
const selectedRepo = ref<GitRepository | null>(null)
const isImporting = ref(false)
const repositoryPageSize = 10
const visibleRepositoryCount = ref(repositoryPageSize)

const form = reactive<GitImportForm>({
  projectName: "",
  repoUrl: "",
  branch: "main",
  framework: "Node.js",
  rootDirectory: "./",
  installCommand: "pnpm install",
  buildCommand: "pnpm build",
  outputDirectory: ".output",
  nodeVersion: "22",
  phpVersion: "8.3",
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

const visibleRepositories = computed(() =>
  filteredRepositories.value.slice(0, visibleRepositoryCount.value),
)

const hasMoreRepositories = computed(() =>
  visibleRepositoryCount.value < filteredRepositories.value.length,
)

onMounted(async () => {
  if (route.query.connected === "true") {
    toast.add({
      title: "Git provider connected",
      color: "success",
    })
  }

  await Promise.all([getConnections(), refreshRepositories(false)])
})

watch(selectedRepo, (repo) => {
  if (!repo) return

  if (repo.provider === "manual") {
    form.projectName = ""
    form.repoUrl = ""
  } else {
    form.projectName = repo.name.split("/").pop() || repo.name
    form.repoUrl = repo.repoUrl
  }

  form.branch = repo.branch
  form.framework = repo.framework
})

watch(search, () => {
  visibleRepositoryCount.value = repositoryPageSize
})

async function connectProvider(provider: GitProvider) {
  if (provider.key === "manual") {
    selectedRepo.value = {
      id: Date.now() * -1,
      repositoryId: `manual-${Date.now()}`,
      provider: "manual",
      name: "Manual Git Repository",
      description: "Import from a public HTTPS URL or an SSH URL configured on this server.",
      branch: form.branch || "main",
      framework: form.framework || "Node.js",
      repoUrl: form.repoUrl,
    }

    return
  }

  const res: any = await api.get(
    `/deployments/${provider.key}/connect-url`,
  )
  const url = res.data?.url || res.url

  if (!url) {
    toast.add({
      title: "Git connection failed",
      description: "The server did not return an OAuth URL.",
      color: "error",
    })

    return
  }

  await navigateTo(url, {
    external: true,
  })
}

async function getConnections() {
  const res: any = await api.get("/deployments/connections", undefined, false)
  const connections = res.data || []

  providers.value = providers.value.map((provider) => {
    const connection = connections.find(
      (item: any) => item.provider === provider.key,
    )

    if (!connection) {
      return {
        ...provider,
        connected: false,
        username: null,
        avatarUrl: null,
      }
    }

    return {
      ...provider,
      connected: true,
      username: connection.username,
      avatarUrl: connection.avatarUrl,
    }
  })
}

async function refreshRepositories(showToast = true) {
  try {
    const res: any = await api.get("/deployments/repositories")
    const data: GitRepository[] = res.data || res.repositories || []

    repositories.value = data
    visibleRepositoryCount.value = repositoryPageSize

    const selectedRepoExists = data.some(
      (repo) => repo.id === selectedRepo.value?.id,
    )

    if (!selectedRepo.value || !selectedRepoExists) {
      selectedRepo.value = data[0] || null
    }

    if (showToast) {
      toast.add({
        title: "Repositories refreshed",
        color: "success",
      })
    }
  } catch {
    toast.add({
      title: "Failed to refresh repositories",
      color: "error",
    })
  }
}

async function deployProject() {
  if (!selectedRepo.value || isImporting.value) return
  const isManual = selectedRepo.value.provider === "manual"
  const repoUrl = isManual ? form.repoUrl.trim() : selectedRepo.value.repoUrl

  if (!repoUrl) {
    toast.add({
      title: "Git URL is required",
      description: "Enter a repository HTTPS or SSH clone URL.",
      color: "error",
    })

    return
  }

  try {
    isImporting.value = true

    const res: any = await api.post("/deployments/projects/import", {
      ...form,
      repositoryId: isManual ? repoUrl : selectedRepo.value.repositoryId,
      provider: selectedRepo.value.provider,
      repoUrl,
      sshUrl: selectedRepo.value.sshUrl,
      htmlUrl: selectedRepo.value.htmlUrl,
    })

    const projectId = res?.data?.id

    toast.add({
      title: "Project import started",
      description: "Redirecting to build logs so you can watch the deployment.",
      color: "success",
    })

    await navigateTo({
      path: "/deployments/build-logs",
      query: projectId ? { project: String(projectId) } : undefined,
    })
  } catch {
    toast.add({
      title: "Import failed",
      description: "Please check your Git connection and server logs.",
      color: "error",
    })
  } finally {
    isImporting.value = false
  }
}

function cancelImport() {
  selectedRepo.value = null
}

function loadMoreRepositories() {
  if (!hasMoreRepositories.value) return

  visibleRepositoryCount.value += repositoryPageSize
}
</script>
