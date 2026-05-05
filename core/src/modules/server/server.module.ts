import { Module } from '@nestjs/common';
import { PermissionModule } from '../permission/permission.module';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { ServerGateway } from './server.gateway';

@Module({
    imports: [PermissionModule],
    controllers: [ServerController],
    providers: [ServerService, ServerGateway],
    exports: [ServerService],
})
export class ServerModule {}
