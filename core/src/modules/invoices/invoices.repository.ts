import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateInvoicesDto } from "./dto/create-invoices.dto";
import { UpdateInvoicesDto } from "./dto/update-invoices.dto";
import { UpdateStatusInvoicesDto } from "./dto/update-status-invoices.dto";

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly detailInclude = {
    customers: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    subscription: {
      include: {
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
      },
    },
  } satisfies Prisma.InvoicesInclude;

  findAll() {
    return this.prisma.invoices.findMany({
      include: this.detailInclude,
    });
  }

  findOne(id: number) {
    return this.prisma.invoices.findUnique({
      where: { id: BigInt(id) },
      include: this.detailInclude,
    });
  }

  create(dto: CreateInvoicesDto) {
    return this.prisma.invoices.create({
      data: dto,
      include: this.detailInclude,
    });
  }

  update(id: number, dto: UpdateInvoicesDto) {
    return this.prisma.invoices.update({
      where: { id: BigInt(id) },
      data: dto,
      include: this.detailInclude,
    });
  }

  updateStatus(id: number, dto: UpdateStatusInvoicesDto) {
    return this.prisma.invoices.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.status,
      },
      include: this.detailInclude,
    });
  }

  remove(id: number) {
    return this.prisma.invoices.delete({ where: { id: BigInt(id) } });
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

    const where: Prisma.InvoicesWhereInput = {};

    if (filter?.search?.trim()) {
      const keyword = filter.search.trim();

      where.OR = [
        {
          code: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          customers: {
            is: {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
        {
          customers: {
            is: {
              email: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
        {
          subscription: {
            is: {
              plan: {
                is: {
                  name: {
                    contains: keyword,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
      ];
    }

    if (filter?.status !== undefined && filter.status !== null) {
      const status = String(filter.status).trim().toLowerCase();

      if (status === "paid" || status === "1") {
        where.status = 1;
      } else if (status === "unpaid" || status === "2") {
        where.status = 2;
      } else if (status === "overdue" || status === "3") {
        where.status = 3;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.invoices.findMany({
        where,
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        include: this.detailInclude,
      }),
      this.prisma.invoices.count({ where }),
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
