// user.mapper.ts
import { User, Role } from '@prisma/client';
import { UserDTO } from './dto/user.dto';
import { RoleMapper } from '../role/role.mapper';

export type UserWithOptionalRelations = User &
  Partial<{
    role: Role | null;
  }>;

export class UserMapper {
  static toDTO(user: UserWithOptionalRelations): UserDTO {
    return {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      image: user.image ?? undefined,
      roleId: user.role_id,
      userTypeId: user.user_type_id,
      // companyId: user.company_id ?? null,
      // branchId: user.branch_id ?? null,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      // Relations: nullable
      role: user.role ? RoleMapper.toDTO(user.role) : undefined,
    };
  }
}
