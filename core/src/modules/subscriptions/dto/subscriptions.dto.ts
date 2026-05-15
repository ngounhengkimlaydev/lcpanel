import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class SubscriptionsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id?: number;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    customer_id!: number;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    plan_id!: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    start_date!: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    end_date!: Date;

    @IsOptional()
    @Type(() => Number)
    @IsEnum(Status)
    status?: Status;
}
