import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { syncSerialSequence } from "../../prisma/sequence.util";
import { CreatePlansDto } from "./dto/create-plans.dto";
import { UpdatePlansDto } from "./dto/update-plans.dto";
import { UpdateStatusPlansDto } from "./dto/update-status-plans.dto";

@Injectable()
export class PlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  private shouldRetryCreateWithSyncedSequence(error: unknown) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    if (error.code !== "P2002") {
      return false;
    }

    const target = error.meta?.target;

    if (Array.isArray(target)) {
      return target.includes("id");
    }

    return typeof target === "string" && target.includes("id");
  }

  findAll() {
    return this.prisma.plans.findMany();
  }

  findOne(id: number) {
    return this.prisma.plans.findUnique({ where: { id } });
  }

  async create(dto: CreatePlansDto) {
    const { id: _ignoredId, ...data } = dto as CreatePlansDto & { id?: number };

    try {
      return await this.prisma.plans.create({ data });
    } catch (error) {
      if (!this.shouldRetryCreateWithSyncedSequence(error)) {
        throw error;
      }

      await syncSerialSequence(this.prisma, "plans");
      return this.prisma.plans.create({ data });
    }
  }

  update(id: number, dto: UpdatePlansDto) {
    return this.prisma.plans.update({ where: { id }, data: dto });
  }
  updateStatus(id: number, dto: UpdateStatusPlansDto) {
    return this.prisma.plans.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.plans.delete({ where: { id } });
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
        {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.plans.findMany({
        where,
        skip,
        take: tableSize,
        orderBy: {
          [sortBy]: sortType,
        },
        select: {
          name: true,
          description: true,
          price: true,
          cpu: true,
          ram: true,
          domain: true,
          bandwidth: true,
          email: true,
          ssl: true,
          disk_space: true,
          database: true,
          website: true,
          ftp_account: true,
          cronjob: true,
          backup: true,
          cdn: true,
          staging: true,
          ssh_access: true,
          docker_support: true,
          id: true,
          status: true,
          created_at: true,
          updated_at: true,
          type: true,
        },
      }),
      this.prisma.plans.count({ where }),
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
