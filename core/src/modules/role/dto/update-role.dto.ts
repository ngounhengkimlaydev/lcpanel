import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModuleDTO } from '../../module/module.dto';

export class UpdateRoleDto {
    @IsString()
    @IsNotEmpty()
    role_name!: string;

    @IsString()
    @IsOptional()
    role_desc!: string;

    @IsInt()
    @IsNotEmpty()
    user_type_id!: number;

    @IsOptional()
    @IsArray()
    module_permission?: ModuleDTO[];
}
