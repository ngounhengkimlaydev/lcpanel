import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeletePlansDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id!: number;
}
