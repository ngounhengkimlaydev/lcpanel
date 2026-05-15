import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { InvoiceStatus } from "../invoice-status.enum";

export class InvoicesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  customer_id!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  subscription_id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  due_date!: Date;
}
