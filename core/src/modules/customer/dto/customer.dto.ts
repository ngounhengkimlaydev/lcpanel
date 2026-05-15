import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class CustomerDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    user_type_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    role_id?: number;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    gender?: number;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    google?: string;

    @IsOptional()
    @IsString()
    apple_id?: string;

    @IsOptional()
    @IsString()
    firebase_uid?: string;

    @IsOptional()
    @Type(() => Number)
    @IsEnum(Status)
    status?: Status;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    deleted_at?: Date;
}
