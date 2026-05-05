import { Module } from '@nestjs/common';
import { PermissionModule } from '../permission/permission.module';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';

@Module({
    imports: [PermissionModule],
    controllers: [ServerController],
    providers: [ServerService],
    exports: [ServerService],
})
export class ServerModule {}
