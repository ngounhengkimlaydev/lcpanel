import { IsBoolean, IsOptional } from 'class-validator'

export class PullProjectDto {
  @IsBoolean()
  @IsOptional()
  install?: boolean

  @IsBoolean()
  @IsOptional()
  build?: boolean

  @IsBoolean()
  @IsOptional()
  restart?: boolean
}