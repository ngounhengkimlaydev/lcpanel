import { PrismaService } from "../../../prisma/prisma.service";

export async function seedPlans(prisma: PrismaService) {
  console.log("Seeding plans...");

  const plans = [
    {
      id: 1,
      name: "Free",
      description: "Free web hosting starter plan",
      price: 0,
      cpu: 0.5,
      ram: 512,
      disk_space: 1024,
      domain: 1,
      email: 1,
      ssl: true,
      database: 1,
      bandwidth: 10,
      type: 1,
      status: 1,
    },
  ];

  for (const item of plans) {
    await prisma.plans.upsert({
      where: {
        id: item.id,
      },
      update: item,
      create: item,
    });
  }

  console.log("Plans seeded successfully");
}
