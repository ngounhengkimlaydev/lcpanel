<template>
  <div v-if="canView" class="space-y-6">
    <KnowledgeBaseHeader
      :can-create="canCreate"
      @create="open = true"
      @refresh="refresh"
    />

    <KnowledgeBaseStats :articles="articles" />

    <KnowledgeBaseToolbar
      :search="search"
      :status="selectedStatus"
      :category="selectedCategory"
      :category-options="categoryOptions"
      :status-options="statusOptions"
      @update:search="search = $event"
      @update:status="selectedStatus = $event"
      @update:category="selectedCategory = $event"
    />

    <KnowledgeBaseFeatured
      :articles="featuredArticles"
      :can-update="canUpdate"
      @view="viewArticle"
      @edit="editArticle"
    />

    <KnowledgeBaseArticleList
      :articles="filteredArticles"
      :total="articles.length"
      :can-update="canUpdate"
      :can-delete="canDelete"
      @view="viewArticle"
      @edit="editArticle"
      @archive="archiveArticle"
      @toggle-featured="toggleFeatured"
    />

    <KnowledgeBaseFormModal
      v-model:open="open"
      :category-options="createCategoryOptions"
      :status-options="createStatusOptions"
      :difficulty-options="difficultyOptions"
      @submit="createArticle"
    />
  </div>

  <UCard v-else>
    <div class="py-16 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
        <UIcon name="i-lucide-lock" class="size-7" />
      </div>

      <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
      <p class="mt-1 text-sm text-muted">
        You do not have permission to view Knowledge Base.
      </p>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  ArticleDifficulty,
  ArticleStatus,
  KnowledgeBaseArticle,
  KnowledgeBaseForm
} from '~/types/knowledge-base'

const toast = useToast()

/**
 * Replace this with your real module key.
 *
 * Example:
 * moduleKey.KNOWLEDGE_BASE
 */
const MODULE_KEY = 'knowledge_base'

/**
 * Replace this mock permission with your auth store.
 *
 * Example:
 * const authStore = useAuthStore()
 * const currentPermissions = computed(() => authStore.user?.permissions || [])
 */
const currentPermissions = ref([
  {
    module_key: MODULE_KEY,
    permission_name: 'view'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'create'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'update'
  },
  {
    module_key: MODULE_KEY,
    permission_name: 'delete'
  }
])

function hasPermission(permissionName: string) {
  return currentPermissions.value.some(
    (item) =>
      item.module_key === MODULE_KEY &&
      item.permission_name === permissionName
  )
}

const canView = computed(() => hasPermission('view'))
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canDelete = computed(() => hasPermission('delete'))

const open = ref(false)
const search = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

const articles = ref<KnowledgeBaseArticle[]>([
  {
    id: 1,
    title: 'Getting started with LCPANEL',
    description: 'Learn how LCPANEL works and how to manage your server, websites, databases, and deployments.',
    category: 'Getting Started',
    status: 'published',
    difficulty: 'Beginner',
    tags: ['overview', 'dashboard', 'server'],
    views: 1280,
    readTime: 6,
    featured: true,
    icon: 'i-lucide-book-open'
  },
  {
    id: 2,
    title: 'Create and manage websites',
    description: 'Add PHP, Laravel, static websites, domains, subdomains, redirects, and SSL certificates.',
    category: 'Websites',
    status: 'published',
    difficulty: 'Beginner',
    tags: ['website', 'domain', 'ssl'],
    views: 980,
    readTime: 8,
    featured: true,
    icon: 'i-lucide-globe'
  },
  {
    id: 3,
    title: 'Deploy apps from GitHub or GitLab',
    description: 'Connect a Git provider, import a project, configure build commands, and deploy applications.',
    category: 'Deployments',
    status: 'published',
    difficulty: 'Intermediate',
    tags: ['git', 'deployment', 'github'],
    views: 720,
    readTime: 10,
    featured: true,
    icon: 'i-lucide-git-branch'
  },
  {
    id: 4,
    title: 'Manage Node.js applications',
    description: 'Create Node apps, configure environment variables, manage PM2 processes, and view app logs.',
    category: 'Applications',
    status: 'published',
    difficulty: 'Intermediate',
    tags: ['node', 'pm2', 'logs'],
    views: 650,
    readTime: 9,
    featured: false,
    icon: 'i-lucide-terminal'
  },
  {
    id: 5,
    title: 'Database management guide',
    description: 'Create databases, database users, backups, and restore data safely from LCPANEL.',
    category: 'Databases',
    status: 'published',
    difficulty: 'Intermediate',
    tags: ['mysql', 'backup', 'restore'],
    views: 540,
    readTime: 7,
    featured: false,
    icon: 'i-lucide-database'
  },
  {
    id: 6,
    title: 'DNS records and domain setup',
    description: 'Understand A records, CNAME records, DNS propagation, and how to point domains to your server.',
    category: 'DNS',
    status: 'draft',
    difficulty: 'Beginner',
    tags: ['dns', 'domain', 'record'],
    views: 320,
    readTime: 5,
    featured: false,
    icon: 'i-lucide-network'
  },
  {
    id: 7,
    title: 'Firewall and security settings',
    description: 'Configure firewall rules, SSH keys, blocked IPs, malware scans, and server protection.',
    category: 'Security',
    status: 'published',
    difficulty: 'Advanced',
    tags: ['firewall', 'ssh', 'security'],
    views: 430,
    readTime: 11,
    featured: false,
    icon: 'i-lucide-shield-check'
  },
  {
    id: 8,
    title: 'Fix common Nginx and SSL issues',
    description: 'Troubleshoot failed SSL, reverse proxy issues, wrong ports, and website offline problems.',
    category: 'Troubleshooting',
    status: 'published',
    difficulty: 'Advanced',
    tags: ['nginx', 'ssl', 'error'],
    views: 860,
    readTime: 12,
    featured: false,
    icon: 'i-lucide-wrench'
  }
])

const categories = computed(() => {
  return [...new Set(articles.value.map((article) => article.category))]
})

const categoryOptions = computed(() => [
  {
    label: 'All Categories',
    value: 'all'
  },
  ...categories.value.map((category) => ({
    label: category,
    value: category
  }))
])

const createCategoryOptions = computed(() => {
  return categories.value.map((category) => ({
    label: category,
    value: category
  }))
})

const statusOptions = [
  {
    label: 'All Status',
    value: 'all'
  },
  {
    label: 'Published',
    value: 'published'
  },
  {
    label: 'Draft',
    value: 'draft'
  },
  {
    label: 'Archived',
    value: 'archived'
  }
]

const createStatusOptions = [
  {
    label: 'Published',
    value: 'published'
  },
  {
    label: 'Draft',
    value: 'draft'
  },
  {
    label: 'Archived',
    value: 'archived'
  }
]

const difficultyOptions = [
  {
    label: 'Beginner',
    value: 'Beginner'
  },
  {
    label: 'Intermediate',
    value: 'Intermediate'
  },
  {
    label: 'Advanced',
    value: 'Advanced'
  }
]

const filteredArticles = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  return articles.value.filter((article) => {
    const matchSearch =
      !keyword ||
      article.title.toLowerCase().includes(keyword) ||
      article.description.toLowerCase().includes(keyword) ||
      article.category.toLowerCase().includes(keyword) ||
      article.tags.some((tag) => tag.toLowerCase().includes(keyword))

    const matchCategory =
      selectedCategory.value === 'all' || article.category === selectedCategory.value

    const matchStatus =
      selectedStatus.value === 'all' || article.status === selectedStatus.value

    return matchSearch && matchCategory && matchStatus
  })
})

const featuredArticles = computed(() => {
  return articles.value.filter((article) => article.featured)
})

function refresh() {
  toast.add({
    title: 'Knowledge base refreshed',
    color: 'success'
  })
}

function viewArticle(article: KnowledgeBaseArticle) {
  toast.add({
    title: 'Open article',
    description: article.title,
    color: 'primary'
  })
}

function editArticle(article: KnowledgeBaseArticle) {
  if (!canUpdate.value) return

  toast.add({
    title: 'Edit article',
    description: article.title,
    color: 'primary'
  })
}

function toggleFeatured(article: KnowledgeBaseArticle) {
  if (!canUpdate.value) return

  article.featured = !article.featured

  toast.add({
    title: article.featured ? 'Article marked as featured' : 'Article removed from featured',
    description: article.title,
    color: 'success'
  })
}

function archiveArticle(article: KnowledgeBaseArticle) {
  if (!canDelete.value) return

  article.status = 'archived'

  toast.add({
    title: 'Article archived',
    description: article.title,
    color: 'warning'
  })
}

function createArticle(form: KnowledgeBaseForm) {
  if (!canCreate.value) return

  articles.value.unshift({
    id: Date.now(),
    title: form.title,
    description: form.description || 'No description provided.',
    category: form.category,
    status: form.status as ArticleStatus,
    difficulty: form.difficulty as ArticleDifficulty,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    views: 0,
    readTime: form.readTime || 5,
    featured: false,
    icon: 'i-lucide-file-text'
  })

  toast.add({
    title: 'Article created',
    color: 'success'
  })
}
</script>