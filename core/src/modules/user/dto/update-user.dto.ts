import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateUserDTO {
  @IsString()
  full_name!: string;

  @IsString()
  username!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  role_id!: number;

  @IsNumber()
  user_type_id!: number;

  // @IsOptional()
  // @IsNumber()
  // company_id?: number | null;

  // @IsOptional()
  // @IsNumber()
  // branchId?: number | null;

  @IsNumber()
  status?: number | 1;
}
