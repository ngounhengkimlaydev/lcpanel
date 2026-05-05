import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { HashModule } from '../../common/utils/hash/hash.module';
import { UserTypeModule } from '../user-type/user-type.module';
import { RoleModule } from '../role/role.module';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    HashModule,
    UserTypeModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    PrismaService,
    JwtStrategy
  ],
  exports: [JwtModule],
})
export class AuthModule {}
