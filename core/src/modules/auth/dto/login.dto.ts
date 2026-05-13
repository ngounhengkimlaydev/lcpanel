import { IsOptional, IsString } from "class-validator";

export class LoginDTO {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    provider?: "firebase" | "google";

    @IsOptional()
    @IsString()
    idToken?: string;
}
