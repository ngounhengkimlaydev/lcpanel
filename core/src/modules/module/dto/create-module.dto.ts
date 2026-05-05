import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PermissionDTO } from '../../permission/dto/permission.dto';

export class CreateModuleDto {
    @IsNotEmpty()
    @IsString()
    module_name!: string;

    @IsNotEmpty()
    @IsString()
    module_key!: string;

    @IsNumber()
    @IsOptional()
    sequence?: number;

    @IsBoolean()
    @IsOptional()
    featured?: boolean;

    @IsString()
    @IsOptional()
    menu_title?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDTO)
    @IsOptional()
    permission?: PermissionDTO[];
}
