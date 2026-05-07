import { UserTypeConst } from "../../../modules/user-type/user-type.enum";
import { PrismaService } from "./../../../prisma/prisma.service";

export async function seedUserType(prisma: PrismaService) {
  console.log("Seeding user types...");

  const USER_TYPES = [
    { id: 1, type: "super_admin", level: UserTypeConst.SUPER_ADMIN },
    { id: 2, type: "admin", level: UserTypeConst.ADMIN },
    { id: 3, type: "reseller", level: UserTypeConst.RESELLER },
    { id: 4, type: "staff", level: UserTypeConst.STAFF },
    { id: 5, type: "support", level: UserTypeConst.SUPPORT },
    { id: 6, type: "client", level: UserTypeConst.CLIENT },
  ];

  for (const item of USER_TYPES) {
    await prisma.userType.upsert({
      where: { id: item.id },
      update: {
        type: item.type,
        level: item.level,
      },
      create: item,
    });
  }
}
