import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class ServicesDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsEnum(Status)
    @Type(() => Number)
    status!: Status;
}
