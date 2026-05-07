import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO {
    @IsString()
    fullName!: string;

    @IsString()
    username!: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    password!: string;

    @IsNumber()
    roleId!: number;

    @IsNumber()
    userTypeId!: number;

    // @IsOptional()
    // @IsNumber()
    // company_id?: number | null;

    // @IsOptional()
    // @IsNumber()
    // branchId?: number | null;

    @IsNumber()
    status?: number | 1;
}
