import { RoleService } from "./../role/role.service";
import { HashService } from "./../../common/utils/hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserMapper } from "../user/user.mapper";
import { UserTypeService } from "../user-type/user-type.service";
import { FirebaseService } from "../../common/service/firebase.service";
import { RegisterDTO } from "./dto/register.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userTypeSerivce: UserTypeService,
    private readonly roleService: RoleService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async login(dto: LoginDTO) {
    if (dto.idToken) {
      return this.loginWithFirebase(dto.idToken);
    }

    if (!dto.username || !dto.password) {
      throw new BadRequestException("Username/email and password are required");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { email: dto.username },
        ],
      },
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

    if (user) {
      const isMatch = await this.hashService.compare(dto.password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException("Invalid credentials");
      }

      if (!user.status) {
        throw new UnauthorizedException("User is inactive");
      }

      const payload = {
        id: user.id,
        auth_type: "user",
        username: user.username,
        role_id: user.role_id,
        user_type_id: user.user_type_id,
        permissions: user.role.roleModules.map((rm) => rm.module.module_key),
      };

      const token = await this.jwtService.signAsync(payload);
      return this.getResponseData(user.id, token, "user");
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: dto.username },
          { phone: dto.username },
        ],
        deleted_at: null,
      },
    });

    if (!customer || !customer.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const customerPasswordMatches = await this.hashService.compare(dto.password, customer.password);

    if (!customerPasswordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!customer.status) {
      throw new UnauthorizedException("Customer is inactive");
    }

    const payload = this.createCustomerPayload(customer);
    const token = await this.jwtService.signAsync(payload);
    return this.getCustomerResponseData(customer.id, token);
  }

  async register(dto: RegisterDTO) {
    if (dto.idToken) {
      const decoded = await this.firebaseService.verifyIdToken(dto.idToken);
      const email = decoded.email ?? dto.email;

      if (!email) {
        throw new BadRequestException("Firebase account email is required");
      }

      const customer = await this.upsertFirebaseCustomer({
        firebaseUid: decoded.uid,
        email,
        name: dto.name || decoded.name || email.split("@")[0],
        image: decoded.picture,
        phone: dto.phone,
        google: decoded.firebase?.sign_in_provider === "google.com" ? decoded.uid : undefined,
      });

      const token = await this.jwtService.signAsync(this.createCustomerPayload(customer));
      return this.getCustomerResponseData(customer.id, token);
    }

    if (!dto.name || !dto.email || !dto.password) {
      throw new BadRequestException("Name, email and password are required");
    }

    const existing = await this.prisma.customer.findFirst({
      where: {
        email: dto.email,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestException("Customer already exists");
    }

    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? "",
        password: await this.hashService.hash(dto.password),
        status: 1,
      },
    });

    const token = await this.jwtService.signAsync(this.createCustomerPayload(customer));
    return this.getCustomerResponseData(customer.id, token);
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { username: dto.email },
        ],
      },
    });

    const customer = await this.prisma.customer.findFirst({
      where: {
        email: dto.email,
        deleted_at: null,
      },
    });

    const firebaseResetLink = customer?.firebase_uid
      ? await this.firebaseService.createPasswordResetLink(dto.email)
      : null;

    return {
      message: "If the account exists, a password reset flow has been started.",
      exists: Boolean(user || customer),
      ...(firebaseResetLink && { firebaseResetLink }),
    };
  }

  logout() {
    try {
      return { message: "logout success" };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getResponseData(userId: number, token?: string, authType: "user" | "customer" = "user") {
    if (authType === "customer") {
      return this.getCustomerResponseData(userId, token);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        user_type: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        user_type_id: true,
        role_name: true,
      },
      where: {
        user_type: {
          level: {
            lte: user.user_type.level,
          },
        },
      },
      orderBy: {
        user_type: {
          level: "desc",
        },
      },
    });

    const baseDTO = UserMapper.toDTO(user);

    const userDTO = {
      ...baseDTO,
      role_name:
        baseDTO.role?.role_name === "Super Admin"
          ? null
          : (baseDTO.role?.role_name ?? null),
    };

    const user_type = await this.userTypeSerivce.lists(user.user_type_id);

    const roleModule = await this.roleService.getRoleModuleLists(user.role_id);

    const data = {
      user: userDTO,
      user_type,
      roleModule,
      roles,
      ...(token && { token, token_type: "bearer" }),
    };

    return data;
  }

  private async loginWithFirebase(idToken: string) {
    const decoded = await this.firebaseService.verifyIdToken(idToken);

    if (!decoded.email) {
      throw new BadRequestException("Firebase account email is required");
    }

    const customer = await this.upsertFirebaseCustomer({
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email.split("@")[0],
      image: decoded.picture,
      google: decoded.firebase?.sign_in_provider === "google.com" ? decoded.uid : undefined,
    });

    if (!customer.status) {
      throw new UnauthorizedException("Customer is inactive");
    }

    const token = await this.jwtService.signAsync(this.createCustomerPayload(customer));
    return this.getCustomerResponseData(customer.id, token);
  }

  private async upsertFirebaseCustomer(data: {
    firebaseUid: string;
    email: string;
    name: string;
    image?: string;
    phone?: string;
    google?: string;
  }) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { firebase_uid: data.firebaseUid },
          { email: data.email },
        ],
        deleted_at: null,
      },
    });

    if (customer) {
      return this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customer.name || data.name,
          email: customer.email || data.email,
          image: customer.image || data.image,
          phone: customer.phone || data.phone || "",
          firebase_uid: customer.firebase_uid || data.firebaseUid,
          google: customer.google || data.google,
          status: customer.status || 1,
        },
      });
    }

    return this.prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
        phone: data.phone ?? "",
        firebase_uid: data.firebaseUid,
        google: data.google,
        status: 1,
      },
    });
  }

  private createCustomerPayload(customer: {
    id: number;
    name: string;
    email: string | null;
    firebase_uid: string | null;
  }) {
    return {
      id: customer.id,
      auth_type: "customer",
      username: customer.email ?? customer.name,
      email: customer.email,
      firebase_uid: customer.firebase_uid,
      permissions: [],
    };
  }

  private async getCustomerResponseData(customerId: number, token?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.deleted_at) {
      throw new NotFoundException("Customer not found");
    }

    const customerDTO = {
      id: customer.id,
      full_name: customer.name,
      name: customer.name,
      username: customer.email,
      email: customer.email,
      image: customer.image,
      phone: customer.phone,
      role_name: null,
      account_type: "customer",
      user_type: {
        type: "Customer",
      },
    };

    return {
      user: customerDTO,
      customer: customerDTO,
      user_type: [],
      roleModule: [],
      roles: [],
      permissions: [],
      ...(token && { token, token_type: "bearer" }),
    };
  }
}
