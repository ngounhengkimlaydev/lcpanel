export type AdminUser = {
  id: number;
  full_name: string;
  username: string;
  email: null;
  password?: string;
  password_confirmation?: string;
  role_id: number | null;
  role_name?: string;
  user_type_id: number | null;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
};

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
}

export type RoleOption = {
  label: string;
  value: number;
  user_type_id: number;
};
