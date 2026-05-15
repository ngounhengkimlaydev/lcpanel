import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class UpdateStatusSubscriptionsDto {
    @Type(() => Number)
    @IsEnum(Status)
    @IsNotEmpty()
    status!: Status;
}
