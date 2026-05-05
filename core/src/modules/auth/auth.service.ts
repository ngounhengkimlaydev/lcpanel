import { RoleService } from './../role/role.service';
import { HashService } from './../../common/utils/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDTO } from './dto/login.dto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserMapper } from '../user/user.mapper';
import { UserTypeService } from '../user-type/user-type.service';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userTypeSerivce: UserTypeService,
    private readonly roleService: RoleService,
  ) {}

  async login(dto: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        role: {
          include: {
            roleModules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.hashService.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.status) {
      throw new UnauthorizedException('User is inactive');
    }

    const payload = {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      user_type_id: user.user_type_id,
      permissions: user.role.roleModules.map((rm) => rm.module.module_key),
    };

    const token = await this.jwtService.signAsync(payload);
    return this.getResponseData(user.id, token);
  }

  logout() {
    try {
      return { message: 'logout success' };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getResponseData(userId: number, token?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const baseDTO = UserMapper.toDTO(user);

    const userDTO = {
      ...baseDTO,
      role_name:
        baseDTO.role?.role_name === 'super_admin'
          ? null
          : (baseDTO.role?.role_name ?? null),
    };

    const user_type = await this.userTypeSerivce.lists(user.user_type_id);
    const user_type_all = await this.prisma.userType.findMany();
    const roleModule = await this.roleService.getRoleModuleLists(user.role_id);

    const data = {
      user: userDTO,
      user_type,
      user_type_all,
      roleModule,
      ...(token && { token, token_type: 'bearer' }),
    };

    return data;
  }
}
