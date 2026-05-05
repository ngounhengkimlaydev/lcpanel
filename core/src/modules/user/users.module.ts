import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { HashService } from '../../common/utils/hash/hash.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
    imports: [PrismaModule, PermissionModule],
    controllers: [UserController],
    providers: [UserService, JwtStrategy, UserRepository, HashService],
    exports: [UserService, UserRepository],
})
export class UsersModule {}
