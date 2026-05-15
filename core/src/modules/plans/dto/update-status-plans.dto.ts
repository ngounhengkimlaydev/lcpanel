import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class UpdateStatusPlansDto {
    @Type(() => Number)
    @IsEnum(Status)
    @IsNotEmpty()
    status!: Status;
}
