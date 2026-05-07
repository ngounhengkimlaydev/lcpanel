import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/user/users.module';
import { HashModule } from './common/utils/hash/hash.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserTypeModule } from './modules/user-type/user-type.module';
import { ConfigModule } from '@nestjs/config';
import { CodeModule } from './common/utils/code/code.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ModuleModule } from './modules/module/module.module';
import { WriteFileModule } from './common/utils/file/file.module';
import { TelegramModule } from './common/module/telegram.module';
import { UserLogModule } from './modules/user-log/user-log.module';
import { PermissionModule } from './modules/permission/permission.module';
import { Reflector } from '@nestjs/core';
import { ServerModule } from './modules/server/server.module';
import { ServicesModule } from './modules/services/services.module';

// UsersModule
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        UsersModule,
        HashModule,
        CodeModule,
        AuthModule,
        UserTypeModule,
        ModuleModule,
        WriteFileModule,
        TelegramModule,
        UserLogModule,
        PermissionModule,
        ServerModule,
        ServicesModule
    ],
    controllers: [AppController],
    providers: [AppService, Reflector],
})
export class AppModule {}
