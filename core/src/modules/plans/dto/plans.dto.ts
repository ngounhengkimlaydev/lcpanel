import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Status } from "../../../enum/status.enum";

export class PlansDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cpu?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ram?: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  disk_space!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  domain!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  email?: number;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  database!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  website?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ftp_account?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cronjob?: number;

  @IsOptional()
  @IsBoolean()
  backup?: boolean;

  @IsOptional()
  @IsBoolean()
  cdn?: boolean;

  @IsOptional()
  @IsBoolean()
  staging?: boolean;

  @IsOptional()
  @IsBoolean()
  ssh_access?: boolean;

  @IsOptional()
  @IsBoolean()
  docker_support?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  bandwidth!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  type!: number;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status)
  status?: Status;
}
