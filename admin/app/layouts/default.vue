<script setup lang="ts">
import { link } from '#build/ui';
import { useMenu } from './menu'
const { open, links } = useMenu()
const { isNotificationsSlideoverOpen } = useDashboard()
const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value[0]
}])


</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }">
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" tooltip popover />

        <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" tooltip class="mt-auto" />
      </template>

      <!-- <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template> -->
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <template #right="{ collapsed }: any">
            <UTooltip text="Notifications" :shortcuts="['N']">
              <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                <UChip color="error" inset>
                  <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                </UChip>
              </UButton>
            </UTooltip>
            <UserMenu :collapsed="collapsed" />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
