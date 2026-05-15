import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdateStatusCustomerDto } from "./dto/update-status-customer.dto";

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  update(id: number, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: dto });
  }
  updateStatus(id: number, dto: UpdateStatusCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.customer.delete({ where: { id } });
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

    if (filter?.search?.trim()) {
      const keyword = filter.search.trim();

      where.OR = [
        // Add searchable fields here
        // {
        //     name: {
        //         contains: keyword,
        //     },
        // },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        select: {
          subscription: {
            include: {
              plan: {
                select: {
                  name: true,
                  website: true,
                  disk_space: true,
                },
              },
            },
          },
          name: true,
          created_at: true,
          id: true,
          email: true,
          status: true,
          gender: true,
        },
      }),
      this.prisma.customer.count({ where }),
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
