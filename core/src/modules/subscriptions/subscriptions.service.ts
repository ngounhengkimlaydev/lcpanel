import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { FileService } from '../../common/utils/file/file.service';
import { SubscriptionsMapper } from './subscriptions.mapper';
import { SubscriptionsRepository } from './subscriptions.repository';
import { CreateSubscriptionsDto } from './dto/create-subscriptions.dto';
import { UpdateSubscriptionsDto } from './dto/update-subscriptions.dto';
import { UpdateStatusSubscriptionsDto } from './dto/update-status-subscriptions.dto';
import { Activity } from '../user-log/dto/activity.dto';
import { UserLogService } from '../user-log/user-log.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly subscriptionsRepository: SubscriptionsRepository,
        private readonly subscriptionsMapper: SubscriptionsMapper,
        private readonly wf: FileService,
        private readonly userLogService: UserLogService,
    ) {}

    async findAll(params: {
        page?: number;
        tableSize?: number;
        filter?: { search?: string; status?: string | number };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        try {
            const {
                page = 1,
                tableSize = 10,
                filter = {},
                sortBy = 'id',
                sortType = 'desc',
            } = params;

            const result = await this.subscriptionsRepository.paginate({
                page,
                tableSize,
                filter,
                sortBy,
                sortType,
            });

            return {
                data: this.subscriptionsMapper.toResponseList(result.data),
                pagination: {
                    currentPage: page,
                    per_page: tableSize,
                    total: result.total,
                    from: result.from,
                    to: result.to,
                    last_page: result.last_page,
                },
            };
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.subscriptionsRepository.findOne(id);

            if (!data) throw new NotFoundException('Subscriptions not found');

            return this.subscriptionsMapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async create(dto: CreateSubscriptionsDto) {
        try {
            const data = await this.subscriptionsRepository.create(dto);
            await this.userLogService.log({
                module: 'Subscriptions',
                action: Activity.CREATE,
                description: `Created Subscriptions ${data.id}`,
                subjectId: Number(data.id),
                properties: dto,
            });
            return this.subscriptionsMapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async update(id: number, dto: UpdateSubscriptionsDto) {
        try {
            const existing = await this.findOne(id);
            const data = await this.subscriptionsRepository.update(id, dto);
            const changes = await this.userLogService.getChanges(existing, dto);

            await this.userLogService.log({
                module: 'Subscriptions',
                action: Activity.UPDATE,
                description: `Updated Subscriptions ${data.id}`,
                subjectId: Number(data.id),
                properties: changes,
            });

            return this.subscriptionsMapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async updateStatus(id: number, dto: UpdateStatusSubscriptionsDto) {
        try {
            await this.findOne(id);
            const data = await this.subscriptionsRepository.updateStatus(id, dto);
            await this.userLogService.log({
                module: 'Subscriptions',
                action: Activity.UPDATE_STATUS,
                description: `Updated status of Subscriptions ${data.id}`,
                subjectId: Number(data.id),
                properties: dto,
            });
            return this.subscriptionsMapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async remove(id: number) {
        try {
            const existing = await this.findOne(id);
            await this.userLogService.log({
                module: 'Subscriptions',
                action: Activity.DELETE,
                description: `Deleted Subscriptions ${existing.id}`,
                subjectId: existing.id,
            });
            return await this.subscriptionsRepository.remove(id);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }
}
