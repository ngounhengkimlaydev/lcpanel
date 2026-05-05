import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './permission.repository';
import { PermissionGuard } from './permission.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  providers: [
    PermissionService, 
    PermissionRepository, 
    PermissionGuard
  ],
  exports: [
    PermissionService,
    PermissionGuard
  ], 
})
export class PermissionModule {}