import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSubscriptionsDto } from "./dto/create-subscriptions.dto";
import { UpdateSubscriptionsDto } from "./dto/update-subscriptions.dto";
import { UpdateStatusSubscriptionsDto } from "./dto/update-status-subscriptions.dto";

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly listInclude = {
    customer: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    plan: {
      select: {
        id: true,
        name: true,
        price: true,
        website: true,
        disk_space: true,
        bandwidth: true,
        database: true,
        domain: true,
        ssl: true,
      },
    },
    invoices: {
      orderBy: {
        due_date: "desc" as const,
      },
      take: 5,
      select: {
        id: true,
        code: true,
        status: true,
        due_date: true,
        created_at: true,
      },
    },
  } satisfies Prisma.SubscriptionsInclude;

  findAll() {
    return this.prisma.subscriptions.findMany({
      include: this.listInclude,
    });
  }

  findOne(id: number) {
    return this.prisma.subscriptions.findUnique({
      where: { id: BigInt(id) },
      include: this.listInclude,
    });
  }

  create(dto: CreateSubscriptionsDto) {
    return this.prisma.subscriptions.create({
      data: dto,
      include: this.listInclude,
    });
  }

  update(id: number, dto: UpdateSubscriptionsDto) {
    return this.prisma.subscriptions.update({
      where: { id: BigInt(id) },
      data: dto,
      include: this.listInclude,
    });
  }

  updateStatus(id: number, dto: UpdateStatusSubscriptionsDto) {
    return this.prisma.subscriptions.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.status,
      },
      include: this.listInclude,
    });
  }

  remove(id: number) {
    return this.prisma.subscriptions.delete({ where: { id: BigInt(id) } });
  }

  async paginate(params: {
    page: number;
    tableSize: number;
    filter?: { search?: string; status?: string | number };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    const {
      page,
      tableSize,
      filter = {},
      sortBy = "created_at",
      sortType = "desc",
    } = params;
    const skip = (page - 1) * tableSize;

    const where: Prisma.SubscriptionsWhereInput = {};
    const now = new Date();

    if (filter?.search?.trim()) {
      const keyword = filter.search.trim();

      where.OR = [
        {
          customer: {
            is: {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
        {
          customer: {
            is: {
              email: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
        {
          plan: {
            is: {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    if (filter?.status !== undefined && filter.status !== null) {
      const status = String(filter.status).trim().toLowerCase();

      if (status === "active" || status === "1") {
        where.status = 1;
        where.end_date = { gte: now };
      } else if (status === "expired") {
        where.status = 1;
        where.end_date = { lt: now };
      } else if (status === "disabled" || status === "2") {
        where.status = 2;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.subscriptions.findMany({
        where,
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        include: this.listInclude,
      }),
      this.prisma.subscriptions.count({ where }),
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
