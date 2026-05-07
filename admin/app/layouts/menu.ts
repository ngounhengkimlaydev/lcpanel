import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { NavigationMenuItem } from "@nuxt/ui";

export const useMenu = () => {
  const open = ref(false);
  const userStore = useUserStore();

  const isSuperAdmin = computed(() => userStore.isSuperAdmin);

  const links = ref<NavigationMenuItem[][]>([
    [
      {
        label: "Dashboard",
        icon: "i-lucide-layout-dashboard",
        to: "/",
      },

      ...(isSuperAdmin.value
        ? [
            {
              label: "Customers",
              icon: "i-lucide-users",
              to: "/customers",
              module_key: "customers",
            },
            {
              label: "Hosting Plans",
              icon: "i-lucide-package",
              to: "/plans",
            },
            {
              label: "Subscriptions",
              icon: "i-lucide-credit-card",
              to: "/subscriptions",
            },
            {
              label: "Invoices",
              icon: "i-lucide-receipt",
              to: "/invoices",
            },
            {
              label: "Websites",
              icon: "i-lucide-globe",
              type: "trigger" as const,
              children: [
                {
                  label: "All Websites",
                  to: "/websites",
                },
                {
                  label: "Create Website",
                  to: "/websites/create",
                },
                {
                  label: "Domains",
                  to: "/websites/domains",
                },
                {
                  label: "Subdomains",
                  to: "/websites/subdomains",
                },
                {
                  label: "Redirects",
                  to: "/websites/redirects",
                },
              ],
            },
          ]
        : []),
      {
        label: isSuperAdmin.value ? "Applications" : "My Apps",
        icon: "i-lucide-terminal",
        type: "trigger",
        children: [
          {
            label: "Node Apps",
            to: "/apps/node",
          },
          {
            label: "PHP Apps",
            to: "/apps/php",
          },
          {
            label: "WordPress",
            to: "/apps/wordpress",
          },
          {
            label: "Environment Variables",
            to: "/apps/env",
          },
          {
            label: "PM2 Processes",
            to: "/apps/pm2",
          },
          {
            label: "App Logs",
            to: "/apps/logs",
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
          },
          {
            label: "Deploy History",
            to: "/deployments/history",
          },
          {
            label: "Build Logs",
            to: "/deployments/build-logs",
          },
          {
            label: "SSH Deploy Keys",
            to: "/deployments/ssh-keys",
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
          },
          {
            label: "Create Database",
            to: "/databases/create",
          },
          {
            label: "Database Users",
            to: "/databases/users",
          },
          {
            label: "Database Backups",
            to: "/databases/backups",
          },
          {
            label: "phpMyAdmin",
            to: "/databases/phpmyadmin",
          },
        ],
      },
      // Files & FTP
      {
        label: "Files & FTP",
        icon: "i-lucide-folder",
        type: "trigger",
        children: [
          {
            label: "File Manager",
            to: "/files",
          },
          {
            label: "FTP Accounts",
            to: "/files/ftp",
          },
          {
            label: "Storage Usage",
            to: "/files/storage",
          },
        ],
      },
      // Email
      {
        label: "Email",
        icon: "i-lucide-mail",
        type: "trigger",
        children: [
          {
            label: "Mailboxes",
            to: "/email/mailboxes",
          },
          {
            label: "Create Email",
            to: "/email/create",
          },
          {
            label: "Forwarders",
            to: "/email/forwarders",
          },
          {
            label: "Autoresponders",
            to: "/email/autoresponders",
          },
          {
            label: "Mail Logs",
            to: "/email/logs",
          },
        ],
      },
      // SSL Certificates
      {
        label: "SSL Certificates",
        icon: "i-lucide-lock-keyhole",
        to: "/ssl",
        module_key: "ssl",
      },
      // DNS
      {
        label: isSuperAdmin.value ? "DNS Manager" : "My DNS",
        icon: "i-lucide-network",
        to: "/dns",
      },
      // Monitoring
      {
        label: "Monitoring",
        icon: "i-lucide-activity",
        type: "trigger",
        children: [
          {
            label: isSuperAdmin.value ? "Server Metrics" : "My Usage",
            to: "/monitoring",
          },
          {
            label: "Bandwidth",
            to: "/monitoring/bandwidth",
          },
          {
            label: "Uptime",
            to: "/monitoring/uptime",
          },

          ...(isSuperAdmin.value
            ? [
                {
                  label: "Process Monitor",
                  to: "/monitoring/processes",
                },
              ]
            : []),
        ],
      },
      // Backups
      {
        label: "Backups",
        icon: "i-lucide-archive",
        type: "trigger",
        children: [
          {
            label: isSuperAdmin.value ? "All Backups" : "My Backups",
            to: "/backups",
          },
          {
            label: "Backup Schedules",
            to: "/backups/schedules",
          },
          {
            label: "Restore",
            to: "/backups/restore",
          },

          ...(isSuperAdmin.value
            ? [
                {
                  label: "Remote Storage",
                  to: "/backups/storage",
                },
              ]
            : []),
        ],
      },

      ...(isSuperAdmin.value
        ? [
            {
              label: "Security",
              icon: "i-lucide-shield-check",
              type: "trigger" as const,
              children: [
                {
                  label: "Firewall",
                  to: "/security/firewall",
                },
                {
                  label: "SSH Keys",
                  to: "/security/ssh-keys",
                },
                {
                  label: "Blocked IPs",
                  to: "/security/blocked-ips",
                },
                {
                  label: "Malware Scan",
                  to: "/security/malware",
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
                },
                {
                  label: "Ports",
                  to: "/system/ports",
                },
                {
                  label: "Processes",
                  to: "/system/processes",
                },
                {
                  label: "Cron Jobs",
                  to: "/system/cron",
                },
                {
                  label: "Logs",
                  to: "/system/logs",
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
                },
                {
                  label: "Roles",
                  to: "/user-management/roles",
                },
                {
                  label: "Permissions",
                  to: "/user-management/permissions",
                },
                {
                  label: "Activity Logs",
                  to: "/user-management/logs",
                },
              ],
            },
          ]
        : []),
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: "/settings",
      },
    ],
  ]);

  return {
    open,
    links,
  };
};
