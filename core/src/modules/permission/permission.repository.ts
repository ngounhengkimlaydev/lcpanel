import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionRepository {
  constructor(private prisma: PrismaService) {}

  async findRolePermission(
    roleId: number,
    moduleKey: string,
    action: string,
  ): Promise<boolean> {
    const permission = await this.prisma.roleModule.findFirst({
      where: {
        role_id: roleId,
        module: { module_key: moduleKey },
        permission: { permission_name: action },
      },
      select: { id: true },
    });

    return !!permission;
  }
}