import { IsNumber, IsString } from "class-validator";

export class PermissionDTO {
  @IsString()
  permission_name!: string;
}