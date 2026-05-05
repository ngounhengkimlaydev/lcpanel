import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserLogDto } from './dto/create-user-log';

@Injectable()
export class UserLogRespository {
    constructor(private readonly prisma: PrismaService) {}
    async create(data: CreateUserLogDto) {
        return this.prisma.userLog.create({ data });
    }
    async count(where?: Prisma.UserLogWhereInput): Promise<number> {
        return this.prisma.userLog.count({ where });
    }

    async paginate(params: {
        page: number;
        tableSize: number;
        filter?: { search?: string };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        const { page, tableSize, filter = {}, sortBy = 'id', sortType = 'desc' } = params;

        const skip = (page - 1) * tableSize;

        const where: any = {};

        // search filter
        if (filter?.search) {
            where.OR = [
                {
                    brandName: {
                        contains: filter.search,
                        mode: 'insensitive',
                    },
                },
                {
                    code: {
                        contains: filter.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.userLog.findMany({
                where,
                skip,
                take: tableSize,
                orderBy: {
                    [sortBy]: sortType,
                },
                select: {
                    description: true,
                    subject_type: true,
                    event: true,
                    causer_id: true,
                    created_at: true,
                    properties: true,
                },
            }),
            this.prisma.userLog.count({ where }),
        ]);
        
        const usernames = await Promise.all(
            data.map((e: any) =>
                this.prisma.user.findUnique({
                    where: { id: e.causer_id },
                    select: { username: true },
                }),
            ),
        );
        const from = total === 0 ? 0 : skip + 1;
        const to = skip + data.length;
        const last_page = Math.ceil(total / tableSize);
        const res = data.map((e, index) => ({
            ...e,
            username: usernames[index]?.username || null,
        }));
        
        return {
            res,
            total,
            from,
            to,
            last_page,
        };
    }
}
