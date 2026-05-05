import { Module } from '@nestjs/common';
import { PrefixCodeService } from './code.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [PrefixCodeService],
    exports: [PrefixCodeService],
})
export class CodeModule {}
