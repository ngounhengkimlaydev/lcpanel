import type { Plan, PlanStatus } from "~/types";

type PlanBadgeColor = "success" | "warning" | "error" | "neutral";

export const planTypeItems = [
  { label: "Web Hosting", value: 1 },
  { label: "VPS Hosting", value: 2 },
  { label: "Database Hosting", value: 3 },
  { label: "Cloud Hosting", value: 4 },
];

export const planStatusItems = [
  { label: "Inactive", value: 0 },
  { label: "Active", value: 1 },
  { label: "Disabled", value: 2 },
];

export function createDefaultPlan(): Plan {
  return {
    id: 0,
    name: "",
    description: "",
    price: 0,
    status: 1,
    type: 1,
    cpu: undefined,
    ram: undefined,
    disk_space: 1024,
    bandwidth: 10,
    domain: 1,
    website: 1,
    database: 1,
    email: 1,
    ssl: true,
    ftp_account: 1,
    cronjob: 0,
    backup: false,
    cdn: false,
    staging: false,
    ssh_access: false,
    docker_support: false,
    created_at: "",
    updated_at: "",
  };
}

export function getPlanStatusLabel(status: PlanStatus | number | null | undefined) {
  return planStatusItems.find((item) => item.value === status)?.label ?? "Unknown";
}

export function getPlanStatusColor(
  status: PlanStatus | number | null | undefined,
): PlanBadgeColor {
  if (status === 1) return "success";
  if (status === 2) return "error";
  if (status === 0) return "neutral";

  return "warning";
}

export function getPlanTypeLabel(type: number | null | undefined) {
  return planTypeItems.find((item) => item.value === type)?.label ?? "Unknown Plan";
}

export function formatPlanStorage(value: number | null | undefined) {
  if (value === null || value === undefined) return "0 GB";

  const storageInGb = value / 1024;
  const digits = Number.isInteger(storageInGb) ? 0 : 1;

  return `${storageInGb.toFixed(digits)} GB`;
}

export function formatPlanCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}
