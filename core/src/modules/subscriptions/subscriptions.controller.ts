import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionsDto } from './dto/create-subscriptions.dto';
import { UpdateSubscriptionsDto } from './dto/update-subscriptions.dto';
import { UpdateStatusSubscriptionsDto } from './dto/update-status-subscriptions.dto';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('subscriptions')
export class SubscriptionsController {
    static MODULE_KEY = 'subscriptions';

    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get()
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.subscriptionsService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id')
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subscriptionsService.findOne(id);
    }

    @Post()
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: CreateSubscriptionsDto) {
        return this.subscriptionsService.create(dto);
    }

    @Put(':id')
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubscriptionsDto) {
        return this.subscriptionsService.update(id, dto);
    }
    @Put(':id/status')
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusSubscriptionsDto) {
        return this.subscriptionsService.updateStatus(id, dto);
    }

    @Delete(':id')
    @Permission(SubscriptionsController.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.subscriptionsService.remove(id);
    }
}
