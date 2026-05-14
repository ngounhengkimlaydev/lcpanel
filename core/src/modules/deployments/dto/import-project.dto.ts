import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ImportProjectDto {
  @IsString()
  @IsNotEmpty()
  repositoryId!: string;

  @IsIn(["github", "gitlab", "manual"])
  provider!: "github" | "gitlab" | "manual";

  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @IsString()
  @IsNotEmpty()
  repoUrl!: string;

  @IsString()
  @IsOptional()
  sshUrl?: string;

  @IsString()
  @IsOptional()
  htmlUrl?: string;

  @IsString()
  @IsNotEmpty()
  branch!: string;

  @IsString()
  @IsNotEmpty()
  framework!: string;

  @IsString()
  @IsOptional()
  rootDirectory?: string;

  @IsString()
  @IsOptional()
  installCommand?: string;

  @IsString()
  @IsOptional()
  buildCommand?: string;

  @IsString()
  @IsOptional()
  outputDirectory?: string;

  @IsString()
  @IsOptional()
  pm2Name?: string;

  @IsString()
  @IsOptional()
  nodeVersion?: string;

  @IsString()
  @IsOptional()
  phpVersion?: string;
}
