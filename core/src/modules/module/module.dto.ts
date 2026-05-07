export interface PermissionDTO {
  id: number;
  permission_name: string;
}

export interface ModuleDTO {
  id: number;
  moduleName: string;
  moduleKey: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionDTO[];
}