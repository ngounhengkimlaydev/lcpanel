import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { WriteFileModule } from '../../common/utils/file/file.module';

@Module({
    imports: [ConfigModule, WriteFileModule],
    providers: [SeedService, PrismaService],
})
export class SeedModule {}
