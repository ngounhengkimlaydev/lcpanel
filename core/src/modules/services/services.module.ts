import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [ServicesController],
    providers: [ServicesService],
    exports: [ServicesService],
})
export class ServicesModule {}
