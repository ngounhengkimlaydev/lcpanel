import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ModuleRepository } from './module.repository';
import { FileService } from '../../common/utils/file/file.service';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';

@Module({
    imports: [PrismaModule, PermissionModule, UserLogModule],
    controllers: [ModuleController],
    providers: [ModuleService, ModuleRepository, FileService],
    exports: [ModuleRepository, ModuleService],
})
export class ModuleModule {}
