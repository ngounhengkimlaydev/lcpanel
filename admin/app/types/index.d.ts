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
export type Customer = {
  id: number;
  name: string;
  email: string;
  plan: string;
  websites: number;
  storage: string;
  status: string;
  created_at: string;
};

export type Plan = {
  id: number;
  name: string;
  price: number;
  status: string;
  customers: number;
  disk: string;
  bandwidth: string;
  domains: number;
  databases: number;
  emails: number;
  ssl: boolean;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  plan: string;
  websites: number;
  storage: string;
  status: string;
  created_at: string;
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
  name: string;
  description: string;
  users: number;
  status: string;
  permissions: string[];
  created_at: string;
};

export type ModulePermission = {
  id: number;
  module_name: string;
  module_key: string;
  description: string;
  status: string;
  permissions: string[];
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
export type Plan = {
  id: number;
  name: string;
  price: number;
  status: string;
  customers: number;
  disk: string;
  bandwidth: string;
  domains: number;
  databases: number;
  emails: number;
  ssl: boolean;
};
