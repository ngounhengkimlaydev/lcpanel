// module.mapper.ts
import { Module, Permission } from '@prisma/client';
import { ModuleDTO, PermissionDTO } from './module.dto';

export class ModuleMapper {
    // Map a single Module entity to DTO
    static toDTO(module: Module & { permissions?: Permission[] }): ModuleDTO {
        return {
            id: module.id,
            moduleName: module.module_name,
            moduleKey: module.module_key,
            featured: module.featured,
            sequence: module.sequence ?? undefined,
            menuTitle: module.menu_title ?? undefined,
            createdAt: module.created_at,
            updatedAt: module.updated_at,
            permissions: module.permissions
                ? module.permissions.map((p) => this.permissionToDTO(p))
                : [],
        };
    }

    // Map a Permission entity to DTO
    private static permissionToDTO(permission: Permission): PermissionDTO {
        return {
            id: permission.id,
            permission_name: permission.permission_name,
        };
    }

    // Map an array of Modules
    static toDTOList(modules: (Module & { permissions?: Permission[] })[]): ModuleDTO[] {
        return modules.map((m) => this.toDTO(m));
    }
}
