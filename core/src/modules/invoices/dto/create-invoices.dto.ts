import { OmitType } from '@nestjs/mapped-types';

import { InvoicesDto } from './invoices.dto';

export class CreateInvoicesDto extends OmitType(InvoicesDto, ['id'] as const) {}
