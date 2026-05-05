import { IsString, IsOptional, IsNumber, IsObject, IsUUID } from 'class-validator';

export class CreateUserLogDto {
    @IsOptional()
    id?: number;

    @IsOptional()
    @IsString()
    log_name?: string;

    @IsString()
    description!: string;

    @IsOptional()
    @IsString()
    subject_type?: string;

    @IsOptional()
    @IsString()
    event?: string;

    @IsOptional()
    @IsNumber()
    subject_id?: number;

    @IsOptional()
    @IsString()
    causer_type?: string;

    @IsOptional()
    @IsNumber()
    causer_id?: number;

    @IsOptional()
    @IsObject()
    properties?: Record<string, any>;

    @IsOptional()
    @IsUUID()
    batch_uuid?: string;
}
