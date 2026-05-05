import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserTypeConst } from "./user-type.enum";

@Injectable()
export class UserTypeService {
    constructor(private readonly prisma: PrismaService){}

    getIdgLevel(): number {
        return UserTypeConst.IDG_LEVEL;
    }

    getCompanyLevel(): number {
        return UserTypeConst.COMPANY_LEVEL;
    }

    getBranchLevel(): number {
        return UserTypeConst.BRANCH_LEVEL;
    }

    isSuper(userTypeId: number): boolean {
        return userTypeId === UserTypeConst.IDG_ID;
    }

    getCompanyId(): number {
        return UserTypeConst.COMPANY_ID;
    }

    getBranchId(): number {
        return UserTypeConst.BRANCH_ID;
    }

    authType(userTypeId: number, type: number): boolean {
        return userTypeId === type;
    }

    //GET AUTH LEVEL
    async userAuthLevel(userTypeId: number): Promise<number | null> {
        const auth = await this.prisma.userType.findUnique({
            where: { id: userTypeId },
            select: { level: true },
        });

        return auth?.level ?? null;
    }

    async lists(userTypeId: number) {
        const authLevel = await this.userAuthLevel(userTypeId);

        if(!authLevel) return [];

        if (
            authLevel === this.getIdgLevel() ||
            authLevel === this.getCompanyLevel()
        ) {
            return this.prisma.userType.findMany({
                where: {
                    level: { lt: authLevel },
                }
            });
        }

        if (authLevel === this.getBranchLevel()) {
            return this.prisma.userType.findMany({
                where: {
                    level: { lte: authLevel },
                }
            });
        }

        return [];
    }
}