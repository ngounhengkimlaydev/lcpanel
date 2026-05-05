import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModuleDTO } from '../../module/module.dto';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    role_name!: string;

    @IsInt()
    @IsNotEmpty()
    user_type_id!: number;

    @IsInt()
    @IsOptional()
    created_by!: number;

    @IsOptional()
    @IsArray()
    module_permission?: ModuleDTO[];
}
