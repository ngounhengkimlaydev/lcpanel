import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserTypeConst } from "./user-type.enum";

@Injectable()
export class UserTypeService {
  constructor(private readonly prisma: PrismaService) {}

  getSuperAdmin(): number {
    return UserTypeConst.SUPER_ADMIN;
  }

  getAdminLevel(): number {
    return UserTypeConst.ADMIN;
  }

  getResellerLevel(): number {
    return UserTypeConst.RESELLER;
  }

  getStaffLevel(): number {
    return UserTypeConst.STAFF;
  }

  getSupportLevel(): number {
    return UserTypeConst.SUPPORT;
  }

  getClientLevel(): number {
    return UserTypeConst.CLIENT;
  }

  isSuper(userTypeId: number): boolean {
    return userTypeId === UserTypeConst.SUPER_ADMIN;
  }

  authType(userTypeId: number, type: number): boolean {
    return userTypeId === type;
  }

  async userAuthLevel(userTypeId: number): Promise<number | null> {
    const auth = await this.prisma.userType.findUnique({
      where: { id: userTypeId },
      select: { level: true },
    });

    return auth?.level ?? null;
  }

  async lists(userTypeId: number) {
    const authLevel = await this.userAuthLevel(userTypeId);

    if (!authLevel) return [];

    return this.prisma.userType.findMany({
      where: {
        level: { lt: authLevel },
      },
      orderBy: {
        level: "desc",
      },
    });
  }
}
