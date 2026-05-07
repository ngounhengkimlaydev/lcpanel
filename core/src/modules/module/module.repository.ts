import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
@Injectable()
export class ModuleRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateModuleDto) {
    return await this.prisma.module.create({ data });
  }

  async findByModuleKey(module_key: string) {
    return this.prisma.module.findFirst({
      where: { module_key },
    });
  }

  async createFromSync(data: any) {
    const { permissions, ...module } = data;

    const savedModule = await this.prisma.module.upsert({
      where: { id: module.id },
      update: {
        module_key: module.module_key,
        module_name: module.module_name,
      },
      create: {
        id: module.id,
        module_key: module.module_key,
        module_name: module.module_name,
      },
    });

    if (permissions && permissions.length) {
      const incomingIds = permissions.map((p: any) => p.id);

      // Delete permissions that exist in DB but are NOT in the JSON
      await this.prisma.permission.deleteMany({
        where: {
          module_id: savedModule.id,
          id: { notIn: incomingIds },
        },
      });

      // Upsert the ones that should exist
      for (const permission of permissions) {
        await this.prisma.permission.upsert({
          where: { id: permission.id },
          update: {
            permission_name: permission.permission_name,
            module_id: savedModule.id,
          },
          create: {
            id: permission.id,
            permission_name: permission.permission_name,
            module_id: savedModule.id,
          },
        });
      }
    } else {
      // If the JSON has NO permissions at all, delete all for this module
      await this.prisma.permission.deleteMany({
        where: { module_id: savedModule.id },
      });
    }
  }

  async update(id: number, data: UpdateModuleDto) {
    return await this.prisma.module.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await this.prisma.module.delete({
      where: { id },
    });
  }

  async getPermissionByModule(moduleId: number) {
    return this.prisma.permission.findMany({
      where: { module_id: moduleId },
    });
  }

  async deletePermissions(ids: number[]) {
    await this.prisma.roleModule.deleteMany({
      where: {
        permission_id: { in: ids },
      },
    });

    return this.prisma.permission.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async createPermission(
    data: { module_id: number; permission_name: string }[],
  ) {
    return this.prisma.permission.createMany({
      data,
    });
  }

  findById(id: number) {
    return this.prisma.module.findUnique({
      where: { id },
      select: {
        id: true,
        module_name: true,
        module_key: true,
        permissions: true,
      },
    });
  }

  findManyByIds(ids: number[]) {
    return this.prisma.module.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  deleteMany(ids: number[]) {
    return this.prisma.module.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async getModuleJson() {
    const data = await this.prisma.module.findMany({
      select: {
        id: true,
        module_name: true,
        module_key: true,
        permissions: true,
      },
    });
    const addCheck = data.map((module) => ({
      ...module,
      permissions: module.permissions.map((permission) => ({
        ...permission,
        checked: 0,
      })),
    }));

    return addCheck;
  }
  async count(where?: Prisma.ModuleWhereInput): Promise<number> {
    return this.prisma.module.count({ where });
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
    if (filter?.search?.trim()) {
      const keyword = filter.search.trim();

      where.OR = [
        {
          module_name: {
            contains: keyword,
          },
        },
        {
          module_key: {
            contains: keyword,
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.module.findMany({
        where,
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        include: {
          permissions: true,
          roleModules: true,
        },
      }),
      this.prisma.module.count({ where }),
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
