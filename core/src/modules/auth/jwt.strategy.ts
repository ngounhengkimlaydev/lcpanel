// jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req) => {
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      secretOrKey: configService.get<string>("JWT_SECRET") ?? "secret",
    });
  }

  async validate(payload: any) {
    // console.log(process.env.JWT_SECRET);

    return {
      id: payload.id,
      username: payload.username,
      role_id: payload.role_id,
      company_id: payload.company_id,
      branch_id: payload.branch_id,
      user_type_id: payload.user_type_id,
      permissions: payload.permissions,
    };
  }
}
