import { Body, Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { CloudflareService } from '../../common/service/cloudflare.service';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('cloudflare')
export class CloudflareController {
    constructor(private readonly cloudflareService: CloudflareService) {}
    static MODULE_KEY = 'cloudflare';

    @Get()
    @Permission(CloudflareController.MODULE_KEY, PermissionAction.VIEW)
    async getCloudflare(@Query('prefix') prefix: string) {
        return await this.cloudflareService.listFiles(prefix);
    }

    @Delete('file')
    @Permission(CloudflareController.MODULE_KEY, PermissionAction.DELETE)
    async deletefileCloudflare(@Body('prefix') prefix: string) {
        return { data: await this.cloudflareService.deleteFile(prefix) };
    }

    @Delete('folder')
    @Permission(CloudflareController.MODULE_KEY, PermissionAction.DELETE)
    async deleteFolderCloudflare(@Body('prefix') prefix: string) {
        return { data: await this.cloudflareService.deleteFolder(prefix) };
    }
}
