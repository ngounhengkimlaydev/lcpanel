import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { UpdatePermissionDto } from '../../permission/dto/update-permission.dto';

export class UpdateModuleDto {
    @IsNotEmpty()
    @IsString()
    module_name!: string;

    @IsNotEmpty()
    @IsString()
    module_key!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePermissionDto)
    @IsOptional()
    permission?: UpdatePermissionDto[];
}
