import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";
import { InvoiceStatus } from "../invoice-status.enum";

export class UpdateStatusInvoicesDto {
  @Type(() => Number)
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status!: InvoiceStatus;
}
