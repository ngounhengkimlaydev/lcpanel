import { Global, Module } from '@nestjs/common';
import { CloudflareService } from '../service/cloudflare.service';
import { CloudflareController } from '../../modules/cloudflare/cloudflare.controller';
import { PermissionModule } from '../../modules/permission/permission.module';
@Global()
@Module({
    imports: [PermissionModule],
    providers: [CloudflareService],
    controllers: [CloudflareController],
    exports: [CloudflareService],
})
export class CloudflareModule {}
