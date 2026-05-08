import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { Prisma } from "@prisma/client";
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDTO) {
    return this.prisma.user.create({
      data: {
        full_name: dto.full_name,
        username: dto.username,
        password: dto.password,
        email: dto.email,
        phone: dto.phone,
        role_id: dto.role_id,
        user_type_id: dto.user_type_id,
        status: dto.status,
      },
    });
  }

  async update(id: number, dto: UpdateUserDTO) {
    return this.prisma.user.update({
      where: { id },
      data: {
        full_name: dto.fullName,
        username: dto.username,
        password: dto.password,
        email: dto.email,
        phone: dto.phone,
        role_id: dto.roleId,
        user_type_id: dto.userTypeId,
        status: dto.status,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByid(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        user_type: true,
        role: true,
      },
    });
  }

  async count(where: Prisma.RoleWhereInput): Promise<number> {
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

    const where: Prisma.UserWhereInput = {};

    if (filter?.search?.trim()) {
      const keyword = filter.search.trim();

      where.OR = [
        {
          full_name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          role: {
            role_name: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        select: {
          id: true,
          full_name: true,
          username: true,
          created_at: true,
          email: true,
          status: true,
          role: {
            select: {
              role_name: true,
            },
          },
          user_type: {
            select: {
              type: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
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
