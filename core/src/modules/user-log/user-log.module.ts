import { Global, Module } from '@nestjs/common';
import { UserLogController } from './user-log.controller';
import { UserLogService } from './user-log.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserLogRespository } from './user-log.repository';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [UserLogController],
    providers: [UserLogService, UserLogRespository],
    exports: [UserLogService],
})
export class UserLogModule {}
