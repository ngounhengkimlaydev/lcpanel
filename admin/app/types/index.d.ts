import type { AvatarProps } from "@nuxt/ui";

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: AvatarProps;
  status: UserStatus;
  location: string;
}

export interface Module {
  id: number;
  module_name: string;
  module_key: string;
  permissions: {
    id: number;
    permission_name: string;
  }[];
  created_at: string;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: User;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  name: string;
  username: string;
  role: "member" | "owner";
  avatar: AvatarProps;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
}

export interface Sale {
  id: string;
  date: string;
  status: SaleStatus;
  email: string;
  amount: number;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}

export type LocaleCode = "en" | "km" | "zh";

export type UserData = {
  id?: number;
  full_name?: string;
  username?: string;
  email?: string | null;
  image?: string | null;
  account_type?: "user" | "customer";
  roles?: string[];
  role_key?: string;
  user_role?: string;
  user_type?: {
    type?: string;
  };
  permissions?: string[];
  role?: {
    id: number;
    role_name: string | undefined;
  };
};

export type RoleModule = {
  role_id?: number;
  module_id?: number;
  module_key?: string;
  permissions?: PermissionItem[];
};

export type UserType = {
  id: number;
  type: string;
  level: number;
  created_at?: string;
};

export type CustomerStatus = 0 | 1 | 2;

export type Customer = {
  id: number;
  name: string;
  email: string | null;
  plan: string;
  websites: number;
  storage: number;
  status: CustomerStatus;
  created_at: string;
};

export type PlanStatus = 0 | 1 | 2;

export type Plan = {
  id: number;
  name: string;
  description: string;
  price: number;
  status: PlanStatus;
  type: number;
  cpu?: number;
  ram?: number;
  disk_space: number;
  bandwidth: number;
  domain: number;
  website: number;
  database: number;
  email?: number;
  ssl: boolean;
  ftp_account?: number;
  cronjob?: number;
  backup?: boolean;
  cdn?: boolean;
  staging?: boolean;
  ssh_access?: boolean;
  docker_support?: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: number;
  customer: string;
  email: string;
  plan: string;
  price: string;
  status: string;
  started_at: string;
  expired_at: string;
  websites: number;
};

export type Invoice = {
  id: string;
  customer: string;
  amount: string;
  status: string;
  due_date: string;
};

export type Role = {
  id: number;
  role_name: string | null;
  description: string;
  user_type: string;
  user_type_id: null | number;
  permissions: string[];
  created_at: string;
};

export type PermissionItem = {
  index: number;
  permission_name: string;
};

export type ModulePermission = {
  id: number;
  module_name: string;
  module_key: string;
  permissions: PermissionItem[];
  created_at: string;
};

export type ActivityLog = {
  id: number;
  user: string;
  email: string;
  module: string;
  action: string;
  description: string;
  status: string;
  ip_address: string;
  created_at: string;
};

export type ServerStats = {
  success: boolean;
  message: string;
  cpu: string;
  ram: string;
  ramUsed: string;
  ramTotal: string;
  disk: number;
  diskUsed: number;
  diskTotal: number;
  timestamp: string;
};
export type SystemServiceStatus = "running" | "stopped" | "failed" | "unknown";

export interface SystemService {
  id: number;
  name: string;
  description: string;
  status: SystemServiceStatus;
  port?: number;
  uptime: string;
  memory: string;
  auto_start: boolean;
}

export type PortStatus = "open" | "closed" | "filtered";

export interface Port {
  id: number;
  port: number;
  protocol: "TCP" | "UDP";
  service: string;
  description: string;
  status: PortStatus;
  created_at: string;
}
export type ProcessStatus = "running" | "stopped" | "sleeping" | "error";

export interface ServerProcess {
  id: number;
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
  status: ProcessStatus;
  uptime: string;
  command: string;
  created_at: string;
}
