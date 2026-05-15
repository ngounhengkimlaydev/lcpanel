import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class UpdateStatusCustomerDto {
    @Type(() => Number)
    @IsEnum(Status)
    @IsNotEmpty()
    status!: Status;
}
