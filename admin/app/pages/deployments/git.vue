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
      :form="form"
      :branch-options="branchOptions"
      :framework-options="frameworkOptions"
      @cancel="cancelImport"
      @import="importProject"
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

const form = reactive<GitImportForm>({
  projectName: "",
  branch: "main",
  framework: "Node.js",
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

  form.projectName = repo.name.split("/").pop() || repo.name
  form.branch = repo.branch
  form.framework = repo.framework
})

async function connectProvider(provider: GitProvider) {
  if (provider.key === "manual") {
    toast.add({
      title: "Manual Git URL",
      description: "Open your manual import modal or page here.",
      color: "primary",
    })

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

async function importProject() {
  if (!selectedRepo.value) return

  try {
    await api.post("/deployments/projects/import", {
      repositoryId: selectedRepo.value.repositoryId,
      provider: selectedRepo.value.provider,
      repoUrl: selectedRepo.value.repoUrl,
      sshUrl: selectedRepo.value.sshUrl,
      htmlUrl: selectedRepo.value.htmlUrl,
      ...form,
    })

    toast.add({
      title: "Project imported",
      description: "LCPANEL can now pull and deploy this project.",
      color: "success",
    })

    await refreshRepositories(false)
  } catch {
    toast.add({
      title: "Import failed",
      description: "Please check your Git connection and server logs.",
      color: "error",
    })
  }
}

function cancelImport() {
  selectedRepo.value = null
}
</script>
