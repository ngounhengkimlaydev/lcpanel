import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { seedUsers } from "./seeds/user.seed";
import { seedUserType } from "./seeds/userType.seed";
import { seedRole } from "./seeds/role.seed";
import { seedPlans } from "./seeds/plan.seed";
import { syncSerialSequences } from "../../prisma/sequence.util";

const SEEDED_TABLES_WITH_MANUAL_IDS = ["user_type", "role", "plans"] as const;

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    console.log("🌱 Start seeding...");
    await seedUserType(this.prisma);
    await seedRole(this.prisma);
    await seedUsers(this.prisma);
    await seedPlans(this.prisma);
    await syncSerialSequences(this.prisma, SEEDED_TABLES_WITH_MANUAL_IDS);
    console.log("✅ Seeding completed");
  }
}
