import { Inject, Injectable } from '@nestjs/common';
import { UserLogRespository } from './user-log.repository';
import { CreateUserLogDto } from './dto/create-user-log';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class UserLogService {
    constructor(
        private readonly userLogRepo: UserLogRespository,
        @Inject(REQUEST) private readonly request: Request,
    ) {}
    private get currentUserId(): number | undefined {
        return (this.request as any).user?.id;
    }
    async findAll(params: {
        page?: number;
        tableSize?: number;
        filter?: { search?: string };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        const { page = 1, tableSize = 10, filter = {}, sortBy = 'id', sortType = 'desc' } = params;

        const result = await this.userLogRepo.paginate({
            page,
            tableSize,
            filter,
            sortBy,
            sortType,
        });

        return {
            data: result.res,
            pagination: {
                currentPage: page,
                per_page: tableSize,
                total: result.total,
                from: result.from,
                to: result.to,
                last_page: result.last_page,
            },
        };
    }
    async createActivityLog(data: CreateUserLogDto) {
        try {
            return await this.userLogRepo.create(data);
        } catch (error) {
            console.error('UserLog error:', error);
        }
    }

    async log({
        module,
        action,
        description,
        subjectId,
        properties,
    }: {
        module: string;
        action: string;
        description: string;
        subjectId?: number;
        properties?: Record<string, any>;
    }) {
        return this.createActivityLog({
            log_name: module,
            description,
            subject_type: module,
            event: action,
            subject_id: subjectId,
            causer_type: 'USER',
            causer_id: this.currentUserId,
            properties,
            batch_uuid: crypto.randomUUID(),
        });
    }
    async getChanges(oldData: any, newData: any) {
        const changes: Record<string, { old: any; new: any }> = {};

        for (const key in newData) {
            if (newData[key] !== undefined && oldData[key] !== newData[key]) {
                changes[key] = {
                    old: oldData[key],
                    new: newData[key],
                };
            }
        }

        return changes;
    }
}
