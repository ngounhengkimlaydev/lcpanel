import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRepository } from './module.repository';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleMapper } from './module.mapper';
import { PermissionDTO } from '../permission/dto/permission.dto';
import { FileService } from '../../common/utils/file/file.service';
import { UserLogService } from '../user-log/user-log.service';
import { Activity } from '../user-log/dto/activity.dto';

@Injectable()
export class ModuleService {
  constructor(
    private readonly moduleRepo: ModuleRepository,
    private readonly fileService: FileService,
    private readonly userLogService: UserLogService,
  ) {}

  async create(dto: CreateModuleDto) {
    try {
      const { permission, ...moduleData } = dto;
      const exist = await this.moduleRepo.findByModuleKey(dto.module_key);

      if (exist) {
        throw new BadRequestException(
          `Module key "${dto.module_key}" already exists`,
        );
      }
      const module = await this.moduleRepo.create(moduleData);

      if (permission?.length) {
        const permissions = permission.map((p) => ({
          module_id: module.id,
          permission_name: p.permission_name,
        }));

        await this.moduleRepo.createPermission(permissions);
      }
      const data = await this.moduleRepo.getModuleJson();
      await this.userLogService.log({
        module: 'Module',
        action: Activity.CREATE,
        description: `Created Module ${module.module_name}`,
        subjectId: module.id,
        properties: dto,
      });
      await this.fileService.writeJson('data', 'modules.json', data);
      return module;
    } catch (error) {
      // if ((error as { code?: string }).code === 'P2002') {
      //     throw new BadRequestException('Module key already exists');
      // }

      throw new InternalServerErrorException(error);
    }
  }

  async update(id: number, dto: UpdateModuleDto) {
    try {
      const existing = await this.moduleRepo.findById(id);
      if (!existing) throw new NotFoundException('Module not found');

      const { permission, ...moduleData } = dto;

      const module = await this.moduleRepo.update(id, moduleData);

      if (permission) {
        const existingPermissions =
          await this.moduleRepo.getPermissionByModule(id);

        const existingIds = existingPermissions.map((p) => p.id);
        const incomingIds = permission.filter((p) => p.id).map((p) => p.id);

        const removeIds = existingIds.filter((id) => !incomingIds.includes(id));

        if (removeIds.length) {
          await this.moduleRepo.deletePermissions(removeIds);
        }

        const newPermissions = permission
          .filter((p) => !p.id)
          .map((p) => ({
            module_id: id,
            permission_name: p.permission_name,
          }));

        if (newPermissions.length) {
          await this.moduleRepo.createPermission(newPermissions);
        }
      }
      await this.userLogService.log({
        module: 'Module',
        action: Activity.UPDATE,
        description: `Updated Module ${module.module_name}`,
        subjectId: module.id,
        properties: dto,
      });
      const data = await this.moduleRepo.getModuleJson();
      await this.fileService.writeJson('data', 'modules.json', data);

      return ModuleMapper.toDTO(module);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new BadRequestException('Module key already exists');
      }
      throw new InternalServerErrorException(error);
    }
  }
  async delete(id: number) {
    try {
      const existing = await this.moduleRepo.findById(id);
      if (!existing) throw new NotFoundException('Module not found');
      const module = await this.moduleRepo.delete(id);
      await this.userLogService.log({
        module: 'Module',
        action: Activity.DELETE,
        description: `Deleted Module ${module.module_name}`,
        subjectId: module.id,
      });
      const data = await this.moduleRepo.getModuleJson();
      await this.fileService.writeJson('data', 'modules.json', data);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async sync() {
    try {
      const data = await this.fileService.readJson('data', 'modules.json');
      await Promise.all(
        Object.values(data).map((module: any) =>
          this.moduleRepo.createFromSync(module),
        ),
      );
      return { message: 'sync data success' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      tableSize = 10,
      filter = {},
      sortBy = 'id',
      sortType = 'desc',
    } = params;

    const result = await this.moduleRepo.paginate({
      page,
      tableSize,
      filter,
      sortBy,
      sortType,
    });

    return {
      data: result.data,
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

  async findById(id: number) {
    const data = await this.moduleRepo.findById(id);
    return data;
  }

  async deleteMany(ids: number[]) {
    try {
      const existing = await this.moduleRepo.findManyByIds(ids);

      if (!existing.length) {
        throw new NotFoundException('Module not found');
      }

      const result = await this.moduleRepo.deleteMany(ids);

      await this.userLogService.log({
        module: 'Module',
        action: Activity.DELETE,
        description: `Deleted ${result.count} module(s): ${existing
          .map((item: any) => item.module_name)
          .join(', ')}`,
      });

      const data = await this.moduleRepo.getModuleJson();
      await this.fileService.writeJson('data', 'modules.json', data);

      return {
        message: 'Modules deleted successfully',
        count: result.count,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error);
    }
  }
}
