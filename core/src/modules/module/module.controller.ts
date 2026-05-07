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
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../permission/permission.guard';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { DeleteModuleDto } from './dto/delete-module.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}
  static MODULE_KEY = 'module';
  @Get()
  @Permission(ModuleController.MODULE_KEY, PermissionAction.VIEW)
  async get(
    @Query('page') page: string,
    @Query('table_size') tableSize: string,
    @Query('filter') filter: string,
    @Query('sort_by') sortBy: string,
    @Query('sort_type') sortType: string,
  ) {
    return this.moduleService.findAll({
      page: Number(page) || 1,
      tableSize: Number(tableSize) || 10,
      filter: filter ? JSON.parse(filter) : {},
      sortBy: sortBy || 'id',
      sortType: (sortType as 'asc' | 'desc') || 'desc',
    });
  }
  
  @Get('sync_module')
  @Permission(ModuleController.MODULE_KEY, PermissionAction.VIEW)
  async sync() {
    return this.moduleService.sync();
  }

  @Get(':id')
  @Permission(ModuleController.MODULE_KEY, PermissionAction.VIEW)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findById(id);
  }

  @Post()
  @Permission(ModuleController.MODULE_KEY, PermissionAction.CREATE)
  async create(@Body() dto: CreateModuleDto) {
    return this.moduleService.create(dto);
  }

  @Put(':id')
  @Permission(ModuleController.MODULE_KEY, PermissionAction.UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModuleDto,
  ) {
    await this.moduleService.update(id, dto);
  }

  @Delete()
  deleteMany(@Body() dto: DeleteModuleDto) {
    return this.moduleService.deleteMany(dto.ids);
  }

  @Delete(':id')
  @Permission(ModuleController.MODULE_KEY, PermissionAction.DELETE)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.moduleService.delete(id);
  }
}
