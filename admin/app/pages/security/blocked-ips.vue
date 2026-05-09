<template>
    <div v-if="canView" class="space-y-6">
        <BlockedIpHeader :can-create="canCreate" @create="openCreateModal" @refresh="refresh" />

        <BlockedIpStats :items="blockedIps" />

        <BlockedIpToolbar :search="search" :status="selectedStatus" :scope="selectedScope" :type="selectedType"
            :status-options="statusFilterOptions" :scope-options="scopeFilterOptions" :type-options="typeFilterOptions"
            @update:search="search = $event" @update:status="selectedStatus = $event"
            @update:scope="selectedScope = $event" @update:type="selectedType = $event" />

        <BlockedIpList :items="filteredBlockedIps" :total="blockedIps.length" :can-update="canUpdate"
            :can-delete="canDelete" @edit="openEditModal" @unblock="unblockIp" @delete="deleteIp"
            @whitelist="whitelistIp" />

        <BlockedIpFormModal v-model:open="open" :item="editingItem" :status-options="statusOptions"
            :scope-options="scopeOptions" :type-options="typeOptions" @submit="submitBlockedIp" />
    </div>

    <UCard v-else>
        <div class="py-16 text-center">
            <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted">
                <UIcon name="i-lucide-lock" class="size-7" />
            </div>

            <h2 class="mt-4 text-lg font-bold text-highlighted">Permission denied</h2>
            <p class="mt-1 text-sm text-muted">
                You do not have permission to view blocked IPs.
            </p>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
import BlockedIpFormModal from '~/components/blocked-ips/BlockedIpFormModal.vue'
import BlockedIpHeader from '~/components/blocked-ips/BlockedIpHeader.vue'
import BlockedIpList from '~/components/blocked-ips/BlockedIpList.vue'
import BlockedIpStats from '~/components/blocked-ips/BlockedIpStats.vue'
import BlockedIpToolbar from '~/components/blocked-ips/BlockedIpToolbar.vue'
import type {
    BlockedIp,
    BlockedIpForm,
    BlockedIpScope,
    BlockedIpStatus,
    BlockedIpType
} from '~/types/blocked-ip'

const toast = useToast()

/**
 * Use your real key:
 * moduleKey.BLOCK_IP
 */
const MODULE_KEY = 'block_ip'

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
const selectedScope = ref('all')
const selectedType = ref('all')
const editingItem = ref<BlockedIp | null>(null)

const blockedIps = ref<BlockedIp[]>([
    {
        id: 1,
        ip: '185.220.101.42',
        reason: 'Too many failed SSH login attempts',
        country: 'Germany',
        attempts: 48,
        type: 'auto',
        scope: 'ssh',
        status: 'active',
        blockedAt: '2026-05-09T09:30',
        expiresAt: '2026-05-10T09:30'
    },
    {
        id: 2,
        ip: '45.155.205.233',
        reason: 'Suspicious HTTP requests detected',
        country: 'Netherlands',
        attempts: 126,
        type: 'firewall',
        scope: 'http',
        status: 'active',
        blockedAt: '2026-05-09T08:12',
        expiresAt: null
    },
    {
        id: 3,
        ip: '103.102.46.11',
        reason: 'Manual block from admin',
        country: 'Cambodia',
        attempts: 5,
        type: 'manual',
        scope: 'global',
        status: 'active',
        blockedAt: '2026-05-08T14:45',
        expiresAt: null
    },
    {
        id: 4,
        ip: '91.240.118.172',
        reason: 'Repeated mail authentication failure',
        country: 'Russia',
        attempts: 77,
        type: 'auto',
        scope: 'mail',
        status: 'expired',
        blockedAt: '2026-05-06T22:10',
        expiresAt: '2026-05-07T22:10'
    },
    {
        id: 5,
        ip: '116.212.144.96',
        reason: 'Trusted server IP',
        country: 'Cambodia',
        attempts: 0,
        type: 'manual',
        scope: 'global',
        status: 'whitelisted',
        blockedAt: '2026-05-05T11:20',
        expiresAt: null
    }
])

const statusFilterOptions = [
    {
        label: 'All Status',
        value: 'all'
    },
    {
        label: 'Active',
        value: 'active'
    },
    {
        label: 'Expired',
        value: 'expired'
    },
    {
        label: 'Whitelisted',
        value: 'whitelisted'
    }
]

const scopeFilterOptions = [
    {
        label: 'All Scopes',
        value: 'all'
    },
    {
        label: 'Global',
        value: 'global'
    },
    {
        label: 'SSH',
        value: 'ssh'
    },
    {
        label: 'HTTP',
        value: 'http'
    },
    {
        label: 'Mail',
        value: 'mail'
    },
    {
        label: 'Database',
        value: 'database'
    }
]

const typeFilterOptions = [
    {
        label: 'All Types',
        value: 'all'
    },
    {
        label: 'Manual',
        value: 'manual'
    },
    {
        label: 'Auto',
        value: 'auto'
    },
    {
        label: 'Firewall',
        value: 'firewall'
    }
]

const statusOptions = statusFilterOptions.filter((item) => item.value !== 'all')
const scopeOptions = scopeFilterOptions.filter((item) => item.value !== 'all')
const typeOptions = typeFilterOptions.filter((item) => item.value !== 'all')

const filteredBlockedIps = computed(() => {
    const keyword = search.value.toLowerCase().trim()

    return blockedIps.value.filter((item) => {
        const matchSearch =
            !keyword ||
            item.ip.toLowerCase().includes(keyword) ||
            item.reason.toLowerCase().includes(keyword) ||
            item.country.toLowerCase().includes(keyword)

        const matchStatus =
            selectedStatus.value === 'all' || item.status === selectedStatus.value

        const matchScope =
            selectedScope.value === 'all' || item.scope === selectedScope.value

        const matchType =
            selectedType.value === 'all' || item.type === selectedType.value

        return matchSearch && matchStatus && matchScope && matchType
    })
})

function refresh() {
    toast.add({
        title: 'Blocked IPs refreshed',
        color: 'success'
    })
}

function openCreateModal() {
    if (!canCreate.value) return

    editingItem.value = null
    open.value = true
}

function openEditModal(item: BlockedIp) {
    if (!canUpdate.value) return

    editingItem.value = item
    open.value = true
}

function submitBlockedIp(form: BlockedIpForm) {
    if (editingItem.value) {
        if (!canUpdate.value) return

        Object.assign(editingItem.value, {
            ip: form.ip,
            reason: form.reason,
            country: form.country,
            attempts: form.attempts,
            type: form.type as BlockedIpType,
            scope: form.scope as BlockedIpScope,
            status: form.status as BlockedIpStatus,
            expiresAt: form.expiresAt || null
        })

        toast.add({
            title: 'Blocked IP updated',
            color: 'success'
        })

        return
    }

    if (!canCreate.value) return

    blockedIps.value.unshift({
        id: Date.now(),
        ip: form.ip,
        reason: form.reason,
        country: form.country,
        attempts: form.attempts,
        type: form.type as BlockedIpType,
        scope: form.scope as BlockedIpScope,
        status: form.status as BlockedIpStatus,
        blockedAt: new Date().toISOString().slice(0, 16),
        expiresAt: form.expiresAt || null
    })

    toast.add({
        title: 'IP blocked successfully',
        color: 'success'
    })
}

function unblockIp(item: BlockedIp) {
    if (!canUpdate.value) return

    item.status = 'expired'

    toast.add({
        title: 'IP unblocked',
        description: item.ip,
        color: 'success'
    })
}

function whitelistIp(item: BlockedIp) {
    if (!canUpdate.value) return

    item.status = 'whitelisted'

    toast.add({
        title: 'IP whitelisted',
        description: item.ip,
        color: 'primary'
    })
}

function deleteIp(item: BlockedIp) {
    if (!canDelete.value) return

    blockedIps.value = blockedIps.value.filter((blockedIp) => blockedIp.id !== item.id)

    toast.add({
        title: 'Blocked IP deleted',
        description: item.ip,
        color: 'error'
    })
}
</script>