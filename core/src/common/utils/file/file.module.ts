import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { FileService } from './file.service';
import { TelegramModule } from '../../module/telegram.module';

@Global()
@Module({
    imports: [PrismaModule,TelegramModule],
    providers: [FileService],
    exports: [FileService],
})
export class WriteFileModule {}
