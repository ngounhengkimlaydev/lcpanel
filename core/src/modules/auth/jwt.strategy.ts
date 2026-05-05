// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: (req) => {
                // console.log('JWT headers seen by Nest:', req.headers);
                return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            },
            secretOrKey: process.env.JWT_SECRET || 'idg-secret',
        });
    }

    async validate(payload: any) {
        // console.log('JWT VALIDATE:', payload);
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
