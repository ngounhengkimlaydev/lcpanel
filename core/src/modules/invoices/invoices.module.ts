import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { InvoicesController } from './invoices.controller';
import { InvoiceDocumentService } from './invoice-document.service';
import { InvoiceMailService } from './invoice-mail.service';
import { InvoicesMapper } from './invoices.mapper';
import { InvoicesRepository } from './invoices.repository';
import { InvoicesService } from './invoices.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [InvoicesController],
    providers: [
        InvoicesService,
        InvoicesRepository,
        InvoicesMapper,
        InvoiceDocumentService,
        InvoiceMailService,
    ],
    exports: [InvoicesService],
})
export class InvoicesModule {}
