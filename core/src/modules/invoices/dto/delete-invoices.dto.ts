import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteInvoicesDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id!: number;
}
