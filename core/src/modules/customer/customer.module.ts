import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { CustomerController } from './customer.controller';
import { CustomerMapper } from './customer.mapper';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [CustomerController],
    providers: [CustomerService, CustomerRepository, CustomerMapper],
    exports: [CustomerService],
})
export class CustomerModule {}
