export interface PermissionDTO {
  id: number;
  permission_name: string;
}

export interface ModuleDTO {
  id: number;
  moduleName: string;
  moduleKey: string;
  featured: boolean;
  sequence?: number;
  menuTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionDTO[];
}