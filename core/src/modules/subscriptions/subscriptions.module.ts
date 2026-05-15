import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsMapper } from './subscriptions.mapper';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, SubscriptionsRepository, SubscriptionsMapper],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
