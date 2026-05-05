import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FileService } from '../common/utils/file/file.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from '../common/module/telegram.module';

@Module({
    imports: [ConfigModule, TelegramModule],
    providers: [PrismaService, FileService],
    exports: [PrismaService],
})
export class PrismaModule {}
