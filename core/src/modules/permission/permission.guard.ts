import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('permission start');
    const permission = this.reflector.get<{ module: string; action: string }>(
      'permission',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admin bypass
    if (user?.user_type_id === 1) return true;

    // If no permission metadata, allow
    if (!permission) return true;
    const hasPermission = await this.permissionService.hasPermission(
      user.role_id,
      permission.module,
      permission.action,
    );

    if (!hasPermission) throw new ForbiddenException('No permission');

    return true;
  }
}