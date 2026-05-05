import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PermissionDTO } from './permission.dto';

export class UpdatePermissionDto extends PermissionDTO {
    @IsOptional()
    @IsNumber()
    id?: number;
}
