import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { PermissionGuard } from '../permission/permission.guard';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}
    static MODULE_KEY = 'user_role';
    @Get()
    @Permission(RoleController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.roleService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get('get_module_permission')
    @Permission(RoleController.MODULE_KEY, PermissionAction.VIEW)
    async getModulePermission() {
        return await this.roleService.getPermissionModuleList();
    }

    @Get(':id')
    @Permission(RoleController.MODULE_KEY, PermissionAction.VIEW)
    async findById(@Param('id') id: number) {
        return await this.roleService.findById(id);
    }

    @Post()
    @Permission(RoleController.MODULE_KEY, PermissionAction.CREATE)
    async create(@Body() dto: CreateRoleDto, @Req() req: any) {
        const userId = req.user.id;
        return await this.roleService.create(dto, userId);
    }

    @Put(':id')
    @Permission(RoleController.MODULE_KEY, PermissionAction.UPDATE)
    async update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
        return await this.roleService.update(id, dto);
    }

    @Delete(':id')
    @Permission(RoleController.MODULE_KEY, PermissionAction.DELETE)
    async delete(@Param('id') id: number) {
        return await this.roleService.delete(id);
    }
}
