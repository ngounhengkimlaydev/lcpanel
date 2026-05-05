import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserDTO } from './dto/user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PermissionGuard } from '../permission/permission.guard';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('user')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService) {}
    static MODULE_KEY = 'user';
    @Get()
    @Permission(UserController.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.userService.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }
    @Get('get_role/:user_type_id')
    @Permission(UserController.MODULE_KEY, PermissionAction.VIEW)
    getAllRole(@Param('user_type_id', ParseIntPipe) user_type_id: number) {
        return this.userService.getRole(user_type_id);
    }
    @Get(':id')
    @Permission(UserController.MODULE_KEY, PermissionAction.VIEW)
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findById(id);
    }

    @Post()
    @Permission(UserController.MODULE_KEY, PermissionAction.CREATE)
    async create(@Body() dto: CreateUserDTO) {
        return this.userService.create(dto);
    }

    @Put(':id')
    @Permission(UserController.MODULE_KEY, PermissionAction.UPDATE)
    async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDTO) {
        return this.userService.update(id, data);
    }

    @Delete(':id')
    @Permission(UserController.MODULE_KEY, PermissionAction.DELETE)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.userService.delete(id);
    }
}
