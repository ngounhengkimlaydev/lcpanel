import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleDto) {
    delete data.id;
    return await this.prisma.role.create({
      data: {
        role_name: data.role_name,
        user_type_id: data.user_type_id,
        created_by: data.created_by,
      },
    });
  }
  async update(id: number, data: UpdateRoleDto) {
    return await this.prisma.role.update({
      where: { id },
      data: {
        role_name: data.role_name,
        user_type_id: data.user_type_id,
      },
    });
  }
  async delete(id: number) {
    await this.prisma.roleModule.deleteMany({
      where: {
        role_id: id,
      },
    });
    return await this.prisma.role.delete({
      where: { id },
    });
  }

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { id: "desc" },
    });
  }

  findById(id: number) {
    return this.prisma.role.findUnique({
      where: { id: id },
    });
  }

  getRoleModule(id: number) {
    return this.prisma.roleModule.findMany({
      where: {
        role_id: id,
      },
      select: {
        id: true,
        module_id: true,
        role_id: true,
        permission_id: true,
      },
    });
  }

  async getPermissionModuleList() {
    const modules = await this.prisma.module.findMany({
      select: {
        id: true,
        module_key: true,
        module_name: true,
        permissions: {
          select: {
            id: true,
            permission_name: true,
            module_id: true,
          },
        },
      },
    });

    return modules.map((module) => ({
      ...module,
      checked: false,
      permissions: module.permissions.map((p) => ({
        ...p,
        checked: false,
      })),
    }));
  }
  async count(where?: Prisma.RoleWhereInput): Promise<number> {
    return this.prisma.role.count({ where });
  }

  async paginate(params: {
    page: number;
    tableSize: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    const {
      page,
      tableSize,
      filter = {},
      sortBy = "id",
      sortType = "desc",
    } = params;

    const skip = (page - 1) * tableSize;

    const where: any = {};

    // search filter
    if (filter?.search) {
      where.OR = [
        {
          roleName: {
            contains: filter.search,
          },
        },
        {
          code: {
            contains: filter.search,
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          NOT: {
            user_type_id: 1,
          },
        },
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },

        select: {
          id: true,
          role_name: true,
          created_at: true,
          user_type: {
            select: {
              type: true,
            },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const from = total === 0 ? 0 : skip + 1;
    const to = skip + data.length;
    const last_page = Math.ceil(total / tableSize);

    return {
      data,
      total,
      from,
      to,
      last_page,
    };
  }
}
