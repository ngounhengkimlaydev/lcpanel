import { PrismaModule } from '../../prisma/prisma.module';
import { UserTypeService } from './user-type.service';
import { Module } from "@nestjs/common";

@Module({
    imports: [PrismaModule],
    providers: [UserTypeService],
    exports: [UserTypeService]
})
export class UserTypeModule {}