import { ref, computed } from "vue";
import type { NavigationMenuItem } from "@nuxt/ui";
import { moduleKey } from "~/utils/module-key";

type ModuleMenuItem = NavigationMenuItem & {
  module_key?: string;
  children?: ModuleMenuItem[];
};

export const useMenu = () => {
  const open = ref(false);
  const userStore = useUserStore();

  const isSuperAdmin = computed(() => userStore.isSuperAdmin);

  const canViewMenuItem = (item: ModuleMenuItem) => {
    return !item.module_key || userStore.hasModule(item.module_key);
  };

  const filterByModule = (items: ModuleMenuItem[]): ModuleMenuItem[] => {
    return items
      .map((item) => {
        const children = item.children
          ? filterByModule(item.children)
          : undefined;

        return {
          ...item,
          ...(children ? { children } : {}),
        };
      })
      .filter((item) => {
        if (!canViewMenuItem(item)) return false;
        if (item.children) return item.children.length > 0;
        return true;
      });
  };

  const links = computed<NavigationMenuItem[][]>(() => [
    filterByModule([
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/",
        module_key: moduleKey.DASHBOARD,
      },

      {
        label: "Customers",
        icon: "i-lucide-users",
        to: "/customers",
        module_key: moduleKey.CUSTOMER,
      },
      {
        label: "Hosting Plans",
        icon: "i-lucide-package",
        to: "/plans",
        module_key: moduleKey.PLAN,
      },
      {
        label: "Subscriptions",
        icon: "i-lucide-credit-card",
        to: "/subscriptions",
        module_key: moduleKey.SUBSCRIPTION,
      },
      {
        label: "Invoices",
        icon: "i-lucide-receipt",
        to: "/invoices",
        module_key: moduleKey.INVOICE,
      },
      {
        label: "Websites",
        icon: "i-lucide-globe",
        type: "trigger" as const,
        badge: "VPS",
        children: [
          {
            label: "All Websites",
            to: "/websites",
            module_key: moduleKey.WEBSITES,
          },
          {
            label: "Create Website",
            to: "/websites/create",
            module_key: moduleKey.WEBSITE_CREATE,
          },
          {
            label: "Domains",
            to: "/websites/domains",
            module_key: moduleKey.DOMAINS,
          },
          {
            label: "Subdomains",
            to: "/websites/subdomains",
            module_key: moduleKey.SUBDOMAINS,
          },
          {
            label: "Redirects",
            to: "/websites/redirects",
            module_key: moduleKey.REDIRECTS,
          },
        ],
      },
      {
        label: "Applications",
        icon: "i-lucide-terminal",
        type: "trigger" as const,
        badge: "VPS",
        children: [
          {
            label: "Node Apps",
            to: "/apps/node",
            module_key: moduleKey.NODE_APPS,
          },
          {
            label: "PHP Apps",
            to: "/apps/php",
            module_key: moduleKey.PHP_APPS,
          },
          {
            label: "WordPress",
            to: "/apps/wordpress",
            module_key: moduleKey.WORDPRESS,
          },
          {
            label: "Environment Variables",
            to: "/apps/env",
            module_key: moduleKey.ENVIRONMENT_VARIABLES,
          },
          {
            label: "PM2 Processes",
            to: "/apps/pm2",
            module_key: moduleKey.PM2_PROCESSES,
          },
          {
            label: "App Logs",
            to: "/apps/logs",
            module_key: moduleKey.APP_LOGS,
          },
        ],
      },
      // Deployment
      {
        label: "Deployments",
        icon: "i-lucide-rocket",
        type: "trigger",
        children: [
          {
            label: "Git Repositories",
            to: "/deployments/git",
            module_key: moduleKey.GIT_REPO,
          },
          {
            label: "Deploy History",
            to: "/deployments/history",
            module_key: moduleKey.GIT_HISTORY,
          },
          {
            label: "Build Logs",
            to: "/deployments/build-logs",
            module_key: moduleKey.BUILD_LOGS,
          },
          {
            label: "SSH Deploy Keys",
            to: "/deployments/ssh-keys",
            module_key: moduleKey.SSH_KEY,
          },
        ],
      },
      // Database
      {
        label: "Databases",
        icon: "i-lucide-database",
        type: "trigger",
        children: [
          {
            label: "Databases",
            to: "/databases",
            module_key: moduleKey.DATABASE,
          },
          {
            label: "Create Database",
            to: "/databases/create",
            module_key: moduleKey.CREATE_DB,
          },
          {
            label: "Database Users",
            to: "/databases/users",
            module_key: moduleKey.DB_USERS,
          },
          {
            label: "Database Backups",
            to: "/databases/backups",
            module_key: moduleKey.DB_BACKUPS,
          },
          {
            label: "phpMyAdmin",
            to: "/databases/phpmyadmin",
            module_key: moduleKey.PHP_MY_ADMIN,
          },
        ],
      },
      // Files & FTP
      {
        label: "Files & FTP",
        icon: "i-lucide-folder",
        type: "trigger",
        badge: "VPS",
        children: [
          {
            label: "File Manager",
            to: "/files",
            badge: "VPS",
            module_key: moduleKey.FILE_MANAGEMER,
          },
          {
            label: "FTP Accounts",
            to: "/files/ftp",
            badge: "VPS",
            module_key: moduleKey.FTP_ACC,
          },
          {
            label: "Storage Usage",
            to: "/files/storage",
            badge: "VPS",
            module_key: moduleKey.STORAGE_USAGE,
          },
        ],
      },
      // Email
      {
        label: "Email",
        icon: "i-lucide-mail",
        type: "trigger",
        badge: "VPS",
        children: [
          {
            label: "Mailboxes",
            to: "/email/mailboxes",
            module_key: moduleKey.MAILBOXES,
          },
          {
            label: "Create Email",
            to: "/email/create",
            module_key: moduleKey.CREATE_MAIL,
          },
          {
            label: "Forwarders",
            to: "/email/forwarders",
            module_key: moduleKey.FORWARDER,
          },
          {
            label: "Autoresponders",
            to: "/email/autoresponders",
            module_key: moduleKey.AUTO_RESPONE,
          },
          {
            label: "Mail Logs",
            to: "/email/logs",
            module_key: moduleKey.MAIL_LOGS,
          },
        ],
      },
      // SSL Certificates
      {
        label: "SSL Certificates",
        icon: "i-lucide-lock-keyhole",
        to: "/ssl",
        module_key: moduleKey.SSL,
      },
      // DNS
      {
        label: isSuperAdmin.value ? "DNS Manager" : "My DNS",
        icon: "i-lucide-network",
        to: "/dns",
        badge: "VPS",
        module_key: moduleKey.DNS,
      },
      // Monitoring
      {
        label: "Monitoring",
        icon: "i-lucide-activity",
        type: "trigger",
        badge: "VPS",
        children: [
          {
            label: isSuperAdmin.value ? "Server Metrics" : "My Usage",
            to: "/monitoring",
            module_key: moduleKey.MONITORING,
          },
          {
            label: "Bandwidth",
            to: "/monitoring/bandwidth",
            module_key: moduleKey.BANDWIDTH,
          },
          // {
          //   label: "Uptime",
          //   to: "/monitoring/uptime",
          //   module_key: moduleKey.UPTIME,
          // },
          // {
          //   label: "Process Monitor",
          //   to: "/monitoring/processes",
          //   module_key: moduleKey.PROCESS,
          // },
        ],
      },
      // Backups
      {
        label: "Backups",
        icon: "i-lucide-archive",
        type: "trigger",
        badge: "VPS",
        children: [
          {
            label: isSuperAdmin.value ? "All Backups" : "My Backups",
            to: "/backups",
            module_key: moduleKey.BACKUPS,
          },
          {
            label: "Backup Schedules",
            to: "/backups/schedules",
            module_key: moduleKey.BACKUP_SCHEDULES,
          },
          {
            label: "Restore",
            to: "/backups/restore",
            module_key: moduleKey.BACKUP_RESTORE,
          },
          {
            label: "Remote Storage",
            to: "/backups/storage",
            module_key: moduleKey.REMOTE_STORAGE,
          },
        ],
      },

      {
        label: "Security",
        icon: "i-lucide-shield-check",
        type: "trigger" as const,
        children: [
          {
            label: "Firewall",
            to: "/security/firewall",
            module_key: moduleKey.FIREWALL,
          },
          {
            label: "SSH Keys",
            to: "/security/ssh-keys",
            module_key: moduleKey.SSH_KEY,
          },
          {
            label: "Blocked IPs",
            to: "/security/blocked-ips",
            module_key: moduleKey.BLOCK_IP,
          },
          {
            label: "Malware Scan",
            to: "/security/malware",
            module_key: moduleKey.MALWARE_SCAN,
          },
        ],
      },
      {
        label: "System",
        icon: "i-lucide-server",
        type: "trigger" as const,
        children: [
          {
            label: "Services",
            to: "/system/services",
            module_key: moduleKey.SERVICE,
          },
          {
            label: "Ports",
            to: "/system/ports",
            module_key: moduleKey.PORT,
          },
          {
            label: "Processes",
            to: "/system/processes",
            module_key: moduleKey.PROCESS,
          },
          {
            label: "Cron Jobs",
            to: "/system/cron",
            module_key: moduleKey.CRON_JOBS,
          },
          {
            label: "Logs",
            to: "/system/logs",
            module_key: moduleKey.SYS_LOG,
          },
        ],
      },
      {
        label: "Support",
        icon: "i-lucide-life-buoy",
        type: "trigger" as const,
        children: [
          {
            label: "Tickets",
            to: "/support/tickets",
          },
          {
            label: "Knowledge Base",
            to: "/support/knowledge-base",
          },
          {
            label: "Announcements",
            to: "/support/announcements",
          },
        ],
      },
      {
        label: "User Management",
        icon: "i-lucide-user-cog",
        type: "trigger" as const,
        children: [
          {
            label: "Admin Users",
            to: "/user-management/users",
            module_key: moduleKey.USER,
          },
          {
            label: "Roles",
            to: "/user-management/roles",
            module_key: moduleKey.ROLE,
          },
          {
            label: "Permissions",
            to: "/user-management/permissions",
            module_key: moduleKey.PERMISSION,
          },
          {
            label: "Activity Logs",
            to: "/user-management/logs",
            module_key: moduleKey.ACTIVITY_LOG,
          },
        ],
      },
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: "/settings",
      },
    ]),
  ]);

  return {
    open,
    links,
  };
};
