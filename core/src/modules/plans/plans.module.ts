import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { PlansController } from './plans.controller';
import { PlansMapper } from './plans.mapper';
import { PlansRepository } from './plans.repository';
import { PlansService } from './plans.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [PlansController],
    providers: [PlansService, PlansRepository, PlansMapper],
    exports: [PlansService],
})
export class PlansModule {}
