import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserLogService } from './user-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModuleKey } from '../auth/decorators/module-key.decorator';

@UseGuards(JwtAuthGuard)
@ModuleKey('user_log')
@Controller('user-log')
export class UserLogController {
    constructor(private readonly userLogService: UserLogService) {}
    @Get()
    async getUserLog(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.userLogService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }
}
