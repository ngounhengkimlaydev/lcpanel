<template>
    <div v-if="canView" class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-highlighted">Announcements</h1>
                <p class="mt-1 text-sm text-muted">
                    Manage platform news, maintenance notices, feature updates, and customer announcements.
                </p>
            </div>

            <div class="flex gap-2">
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" @click="refresh">
                    Refresh
                </UButton>

                <UButton v-if="canCreate" icon="i-lucide-plus" @click="openCreateModal">
                    New Announcement
                </UButton>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'flex items-center justify-between gap-4' }">
                <div>
                    <p class="text-sm text-muted">{{ stat.label }}</p>
                    <p class="mt-1 text-2xl font-bold text-highlighted">{{ stat.value }}</p>
                </div>

                <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UIcon :name="stat.icon" class="size-5" />
                </div>
            </UCard>
        </div>

        <!-- Toolbar -->
        <UCard>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <UInput v-model="search" icon="i-lucide-search" placeholder="Search announcement..."
                    class="w-full lg:max-w-md" />

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
                    <USelect v-model="selectedStatus" :items="statusFilterOptions" value-key="value"
                        class="w-full sm:w-40" />

                    <USelect v-model="selectedPriority" :items="priorityFilterOptions" value-key="value"
                        class="w-full sm:w-40" />

                    <USelect v-model="selectedTarget" :items="targetFilterOptions" value-key="value"
                        class="w-full sm:w-44" />
                </div>
            </div>
        </UCard>

        <!-- Featured / Active Notice -->
        <UCard v-if="activeAnnouncement" :ui="{ body: 'space-y-4' }" class="border-primary/30">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="flex gap-4">
                    <div
                        class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <UIcon name="i-lucide-megaphone" class="size-6" />
                    </div>

                    <div>
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="text-lg font-bold text-highlighted">
                                {{ activeAnnouncement.title }}
                            </h2>

                            <UBadge color="primary" variant="soft">
                                Active
                            </UBadge>

                            <UBadge :color="getPriorityColor(activeAnnouncement.priority)" variant="soft">
                                {{ formatLabel(activeAnnouncement.priority) }}
                            </UBadge>
                        </div>

                        <p class="mt-2 max-w-3xl text-sm text-muted">
                            {{ activeAnnouncement.message }}
                        </p>

                        <div class="mt-4 flex flex-wrap gap-2">
                            <UBadge color="neutral" variant="soft">
                                {{ activeAnnouncement.target }}
                            </UBadge>

                            <UBadge color="neutral" variant="soft">
                                {{ activeAnnouncement.channel }}
                            </UBadge>

                            <UBadge color="neutral" variant="outline">
                                {{ formatDate(activeAnnouncement.publishAt) }}
                            </UBadge>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <UButton icon="i-lucide-eye" color="neutral" variant="soft"
                        @click="previewAnnouncement(activeAnnouncement)">
                        Preview
                    </UButton>

                    <UButton v-if="canUpdate" icon="i-lucide-pencil" color="neutral" variant="soft"
                        @click="openEditModal(activeAnnouncement)">
                        Edit
                    </UButton>
                </div>
            </div>
        </UCard>

        <!-- Announcement List -->
        <UCard :ui="{ body: 'space-y-4' }">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 class="text-lg font-bold text-highlighted">All Announcements</h2>
                    <p class="text-sm text-muted">
                        Showing {{ filteredAnnouncements.length }} of {{ announcements.length }} announcements.
                    </p>
                </div>

                <UButton v-if="canCreate" icon="i-lucide-send" color="neutral" variant="soft" @click="openCreateModal">
                    Create Notice
                </UButton>
            </div>

            <div v-if="filteredAnnouncements.length" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <UCard v-for="announcement in filteredAnnouncements" :key="announcement.id"
                    class="transition hover:border-primary/40">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div class="flex gap-3">
                            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl"
                                :class="getAnnouncementIconClass(announcement.priority)">
                                <UIcon :name="announcement.icon" class="size-5" />
                            </div>

                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="font-semibold text-highlighted">
                                        {{ announcement.title }}
                                    </h3>

                                    <UBadge :color="getStatusColor(announcement.status)" variant="soft">
                                        {{ formatLabel(announcement.status) }}
                                    </UBadge>
                                </div>

                                <p class="mt-1 line-clamp-2 text-sm text-muted">
                                    {{ announcement.message }}
                                </p>

                                <div class="mt-3 flex flex-wrap gap-2">
                                    <UBadge :color="getPriorityColor(announcement.priority)" variant="soft">
                                        {{ formatLabel(announcement.priority) }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="soft">
                                        {{ announcement.target }}
                                    </UBadge>

                                    <UBadge color="neutral" variant="outline">
                                        {{ announcement.channel }}
                                    </UBadge>
                                </div>
                            </div>
                        </div>

                        <UDropdownMenu :items="getActions(announcement)">
                            <UButton icon="i-lucide-more-horizontal" color="neutral" variant="ghost" />
                        </UDropdownMenu>
                    </div>

                    <div
                        class="mt-4 flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-2 text-sm text-muted">
                            <UIcon name="i-lucide-calendar-clock" class="size-4" />
                            <span>{{ formatDate(announcement.publishAt) }}</span>
                        </div>

                        <div class="flex items-center gap-3 text-sm text-muted">
                            <span class="flex items-center gap-1">
                                <UIcon name="i-lucide-eye" class="size-4" />
                                {{ announcement.views }}
                            </span>

                            <span class="flex items-center gap-1">
                                <UIcon name="i-lucide-mouse-pointer-click" class="size-4" />
                                {{ announcement.clicks }}
                            </span>
                        </div>
                    </div>
                </UCard>
            </div>

            <div v-else class="py-16 text-center">
                <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
                    <UIcon name="i-lucide-search-x" class="size-7" />
                </div>

                <h3 class="mt-4 font-semibold text-highlighted">No announcement found</h3>
                <p class="mt-1 text-sm text-muted">
                    Try changing your search or filters.
                </p>
            </div>
        </UCard>

        <!-- Create / Edit Modal -->
        <UModal v-model:open="open" :ui="{
            content: 'max-w-3xl'
        }">
            <template #content>
                <UCard>
                    <template #header>
                        <div>
                            <h3 class="text-lg font-bold text-highlighted">
                                {{ editingAnnouncement ? 'Edit Announcement' : 'Create Announcement' }}
                            </h3>
                            <p class="text-sm text-muted">
                                Send platform updates, maintenance alerts, or feature news to selected users.
                            </p>
                        </div>
                    </template>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <UFormField label="Title" required>
                            <UInput v-model="form.title" placeholder="Example: Scheduled server maintenance" />
                        </UFormField>

                        <UFormField label="Status">
                            <USelect v-model="form.status" :items="statusOptions" value-key="value" />
                        </UFormField>

                        <UFormField label="Priority">
                            <USelect v-model="form.priority" :items="priorityOptions" value-key="value" />
                        </UFormField>

                        <UFormField label="Target Users">
                            <USelect v-model="form.target" :items="targetOptions" value-key="value" />
                        </UFormField>

                        <UFormField label="Channel">
                            <USelect v-model="form.channel" :items="channelOptions" value-key="value" />
                        </UFormField>

                        <UFormField label="Publish Date">
                            <UInput v-model="form.publishAt" type="datetime-local" />
                        </UFormField>

                        <UFormField label="Message" class="md:col-span-2" required>
                            <UTextarea v-model="form.message" :rows="5" placeholder="Write announcement message..." />
                        </UFormField>
                    </div>

                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton color="neutral" variant="soft" @click="open = false">
                                Cancel
                            </UButton>

                            <UButton icon="i-lucide-save" @click="submitAnnouncement">
                                {{ editingAnnouncement ? 'Save Changes' : 'Create Announcement' }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>

    <UCard v-else>
        <div class="py-16 text-center">
            <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
                <UIcon name="i-lucide-lock" class="size-7" />
            </div>

            <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
            <p class="mt-1 text-sm text-muted">
                You do not have permission to view Announcements.
            </p>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
type AnnouncementStatus = 'published' | 'scheduled' | 'draft' | 'expired'
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'critical'
type AnnouncementTarget = 'All Users' | 'Free Plan' | 'Paid Plan' | 'Admins Only'
type AnnouncementChannel = 'Dashboard' | 'Email' | 'Dashboard + Email'

type Announcement = {
    id: number
    title: string
    message: string
    status: AnnouncementStatus
    priority: AnnouncementPriority
    target: AnnouncementTarget
    channel: AnnouncementChannel
    publishAt: string
    views: number
    clicks: number
    icon: string
}

type AnnouncementForm = {
    title: string
    message: string
    status: AnnouncementStatus
    priority: AnnouncementPriority
    target: AnnouncementTarget
    channel: AnnouncementChannel
    publishAt: string
}

const toast = useToast()

/**
 * Replace with your real module key.
 *
 * Example:
 * moduleKey.ANNOUNCEMENT
 */
const MODULE_KEY = 'announcement'

/**
 * Replace this mock permission with your real auth store.
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
const selectedStatus = ref('all')
const selectedPriority = ref('all')
const selectedTarget = ref('all')
const editingAnnouncement = ref<Announcement | null>(null)

const announcements = ref<Announcement[]>([
    {
        id: 1,
        title: 'LCPANEL v1.2 update is now available',
        message: 'We added Git deployment improvements, better app logs, and faster dashboard loading.',
        status: 'published',
        priority: 'normal',
        target: 'All Users',
        channel: 'Dashboard',
        publishAt: '2026-05-09T09:00',
        views: 1240,
        clicks: 210,
        icon: 'i-lucide-sparkles'
    },
    {
        id: 2,
        title: 'Scheduled server maintenance',
        message: 'Some services may restart during the maintenance window. Websites will be monitored automatically.',
        status: 'scheduled',
        priority: 'high',
        target: 'Paid Plan',
        channel: 'Dashboard + Email',
        publishAt: '2026-05-12T23:30',
        views: 420,
        clicks: 88,
        icon: 'i-lucide-construction'
    },
    {
        id: 3,
        title: 'New backup schedule feature',
        message: 'You can now configure daily, weekly, and monthly backups with remote storage support.',
        status: 'published',
        priority: 'normal',
        target: 'All Users',
        channel: 'Dashboard',
        publishAt: '2026-05-04T10:15',
        views: 760,
        clicks: 132,
        icon: 'i-lucide-database-backup'
    },
    {
        id: 4,
        title: 'Free plan resource limit notice',
        message: 'Free plan users will have updated limits for websites, bandwidth, database size, and app deployments.',
        status: 'draft',
        priority: 'low',
        target: 'Free Plan',
        channel: 'Dashboard',
        publishAt: '2026-05-15T08:00',
        views: 0,
        clicks: 0,
        icon: 'i-lucide-info'
    },
    {
        id: 5,
        title: 'Critical SSL renewal issue fixed',
        message: 'We fixed an issue that caused some SSL certificates to fail automatic renewal.',
        status: 'expired',
        priority: 'critical',
        target: 'Admins Only',
        channel: 'Email',
        publishAt: '2026-04-28T14:20',
        views: 310,
        clicks: 64,
        icon: 'i-lucide-shield-alert'
    }
])

const form = reactive<AnnouncementForm>({
    title: '',
    message: '',
    status: 'draft',
    priority: 'normal',
    target: 'All Users',
    channel: 'Dashboard',
    publishAt: ''
})

const statusFilterOptions = [
    {
        label: 'All Status',
        value: 'all'
    },
    {
        label: 'Published',
        value: 'published'
    },
    {
        label: 'Scheduled',
        value: 'scheduled'
    },
    {
        label: 'Draft',
        value: 'draft'
    },
    {
        label: 'Expired',
        value: 'expired'
    }
]

const priorityFilterOptions = [
    {
        label: 'All Priority',
        value: 'all'
    },
    {
        label: 'Low',
        value: 'low'
    },
    {
        label: 'Normal',
        value: 'normal'
    },
    {
        label: 'High',
        value: 'high'
    },
    {
        label: 'Critical',
        value: 'critical'
    }
]

const targetFilterOptions = [
    {
        label: 'All Targets',
        value: 'all'
    },
    {
        label: 'All Users',
        value: 'All Users'
    },
    {
        label: 'Free Plan',
        value: 'Free Plan'
    },
    {
        label: 'Paid Plan',
        value: 'Paid Plan'
    },
    {
        label: 'Admins Only',
        value: 'Admins Only'
    }
]

const statusOptions = statusFilterOptions.filter((item) => item.value !== 'all')
const priorityOptions = priorityFilterOptions.filter((item) => item.value !== 'all')
const targetOptions = targetFilterOptions.filter((item) => item.value !== 'all')

const channelOptions = [
    {
        label: 'Dashboard',
        value: 'Dashboard'
    },
    {
        label: 'Email',
        value: 'Email'
    },
    {
        label: 'Dashboard + Email',
        value: 'Dashboard + Email'
    }
]

const stats = computed(() => [
    {
        label: 'Total Announcements',
        value: announcements.value.length,
        icon: 'i-lucide-megaphone'
    },
    {
        label: 'Published',
        value: announcements.value.filter((item) => item.status === 'published').length,
        icon: 'i-lucide-check-circle'
    },
    {
        label: 'Scheduled',
        value: announcements.value.filter((item) => item.status === 'scheduled').length,
        icon: 'i-lucide-calendar-clock'
    },
    {
        label: 'Total Views',
        value: announcements.value
            .reduce((total, item) => total + item.views, 0)
            .toLocaleString(),
        icon: 'i-lucide-eye'
    }
])

const activeAnnouncement = computed(() => {
    return announcements.value.find((item) => item.status === 'published') || null
})

const filteredAnnouncements = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    return announcements.value.filter((item) => {
        const matchSearch =
            !keyword ||
            item.title.toLowerCase().includes(keyword) ||
            item.message.toLowerCase().includes(keyword) ||
            item.target.toLowerCase().includes(keyword) ||
            item.channel.toLowerCase().includes(keyword)

        const matchStatus =
            selectedStatus.value === 'all' || item.status === selectedStatus.value

        const matchPriority =
            selectedPriority.value === 'all' || item.priority === selectedPriority.value

        const matchTarget =
            selectedTarget.value === 'all' || item.target === selectedTarget.value

        return matchSearch && matchStatus && matchPriority && matchTarget
    })
})

function refresh() {
    toast.add({
        title: 'Announcements refreshed',
        color: 'success'
    })
}

function openCreateModal() {
    if (!canCreate.value) return

    editingAnnouncement.value = null
    resetForm()
    open.value = true
}

function openEditModal(item: Announcement) {
    if (!canUpdate.value) return

    editingAnnouncement.value = item

    Object.assign(form, {
        title: item.title,
        message: item.message,
        status: item.status,
        priority: item.priority,
        target: item.target,
        channel: item.channel,
        publishAt: item.publishAt
    })

    open.value = true
}

function resetForm() {
    Object.assign(form, {
        title: '',
        message: '',
        status: 'draft',
        priority: 'normal',
        target: 'All Users',
        channel: 'Dashboard',
        publishAt: new Date().toISOString().slice(0, 16)
    })
}

function submitAnnouncement() {
    if (!form.title.trim()) {
        toast.add({
            title: 'Title is required',
            color: 'error'
        })

        return
    }

    if (!form.message.trim()) {
        toast.add({
            title: 'Message is required',
            color: 'error'
        })

        return
    }

    if (editingAnnouncement.value) {
        if (!canUpdate.value) return

        Object.assign(editingAnnouncement.value, {
            ...form,
            icon: getIconByPriority(form.priority)
        })

        toast.add({
            title: 'Announcement updated',
            color: 'success'
        })
    } else {
        if (!canCreate.value) return

        announcements.value.unshift({
            id: Date.now(),
            ...form,
            views: 0,
            clicks: 0,
            icon: getIconByPriority(form.priority)
        })

        toast.add({
            title: 'Announcement created',
            color: 'success'
        })
    }

    open.value = false
}

function previewAnnouncement(item: Announcement) {
    toast.add({
        title: item.title,
        description: item.message,
        color: 'primary'
    })
}

function publishAnnouncement(item: Announcement) {
    if (!canUpdate.value) return

    item.status = 'published'

    toast.add({
        title: 'Announcement published',
        description: item.title,
        color: 'success'
    })
}

function archiveAnnouncement(item: Announcement) {
    if (!canDelete.value) return

    item.status = 'expired'

    toast.add({
        title: 'Announcement expired',
        description: item.title,
        color: 'warning'
    })
}

function deleteAnnouncement(item: Announcement) {
    if (!canDelete.value) return

    announcements.value = announcements.value.filter(
        (announcement) => announcement.id !== item.id
    )

    toast.add({
        title: 'Announcement deleted',
        description: item.title,
        color: 'error'
    })
}

function getActions(item: Announcement) {
    const actions: any[][] = [
        [
            {
                label: 'Preview',
                icon: 'i-lucide-eye',
                onSelect: () => previewAnnouncement(item)
            }
        ]
    ]

    if (canUpdate.value) {
        actions.push([
            {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect: () => openEditModal(item)
            },
            {
                label: 'Publish',
                icon: 'i-lucide-send',
                disabled: item.status === 'published',
                onSelect: () => publishAnnouncement(item)
            }
        ])
    }

    if (canDelete.value) {
        actions.push([
            {
                label: 'Expire',
                icon: 'i-lucide-archive',
                onSelect: () => archiveAnnouncement(item)
            },
            {
                label: 'Delete',
                icon: 'i-lucide-trash-2',
                color: 'error',
                onSelect: () => deleteAnnouncement(item)
            }
        ])
    }

    return actions
}

function formatLabel(value: string) {
    return value
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
    if (!value) return '-'

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value))
}

function getStatusColor(status: AnnouncementStatus) {
    const colors = {
        published: 'success',
        scheduled: 'primary',
        draft: 'warning',
        expired: 'neutral'
    } as const

    return colors[status]
}

function getPriorityColor(priority: AnnouncementPriority) {
    const colors = {
        low: 'neutral',
        normal: 'primary',
        high: 'warning',
        critical: 'error'
    } as const

    return colors[priority]
}

function getIconByPriority(priority: AnnouncementPriority) {
    const icons = {
        low: 'i-lucide-info',
        normal: 'i-lucide-megaphone',
        high: 'i-lucide-triangle-alert',
        critical: 'i-lucide-shield-alert'
    }

    return icons[priority]
}

function getAnnouncementIconClass(priority: AnnouncementPriority) {
    const classes = {
        low: 'bg-muted text-muted',
        normal: 'bg-primary/10 text-primary',
        high: 'bg-warning/10 text-warning',
        critical: 'bg-error/10 text-error'
    }

    return classes[priority]
}
</script>

<style></style>