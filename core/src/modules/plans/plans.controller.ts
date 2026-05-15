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
import { PlansService } from './plans.service';
import { CreatePlansDto } from './dto/create-plans.dto';
import { UpdatePlansDto } from './dto/update-plans.dto';
import { UpdateStatusPlansDto } from './dto/update-status-plans.dto';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('plans')
export class PlansController {
    static MODULE_KEY = 'plan';

    constructor(private readonly plansService: PlansService) {}

    @Get()
    @Permission(PlansController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.plansService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id')
    @Permission(PlansController.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.plansService.findOne(id);
    }

    @Post()
    @Permission(PlansController.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: CreatePlansDto) {
        return this.plansService.create(dto);
    }

    @Put(':id')
    @Permission(PlansController.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlansDto) {
        return this.plansService.update(id, dto);
    }
    @Put(':id/status')
    @Permission(PlansController.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusPlansDto) {
        return this.plansService.updateStatus(id, dto);
    }

    @Delete(':id')
    @Permission(PlansController.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.plansService.remove(id);
    }
}
