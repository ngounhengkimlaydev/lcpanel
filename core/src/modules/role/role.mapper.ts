// role.mapper.ts
import { Role } from '@prisma/client';
import { RoleDTO } from './dto/role.dto';

export class RoleMapper {
  static toDTO(role: Role): RoleDTO {
    return {
      id: role.id,
      role_name: role.role_name,
      // roleDesc: role.role_desc
    };
  }
}
