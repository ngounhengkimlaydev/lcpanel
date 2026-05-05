// permission.mapper.ts
import { Permission } from '@prisma/client';
import { PermissionDTO } from './dto/permission.dto';


export class PermissionMapper {
    static toDTO(permission: Permission): PermissionDTO {
        return {
            // id: permission.id,
            permission_name: permission.permission_name,
        };
    }
}
