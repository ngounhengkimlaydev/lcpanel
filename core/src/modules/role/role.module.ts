import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { PermissionModule } from '../permission/permission.module';

@Module({
    imports: [PrismaModule, CacheModule.register(), PermissionModule],
    providers: [RoleService, RoleController, RoleRepository],
    exports: [RoleService, RoleRepository],
    controllers: [RoleController],
})
export class RoleModule {}
