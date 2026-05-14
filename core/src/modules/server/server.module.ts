import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionModule } from '../permission/permission.module';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { ServerGateway } from './server.gateway';

@Module({
    imports: [PermissionModule, AuthModule],
    controllers: [ServerController],
    providers: [ServerService, ServerGateway],
    exports: [ServerService, ServerGateway],
})
export class ServerModule {}
