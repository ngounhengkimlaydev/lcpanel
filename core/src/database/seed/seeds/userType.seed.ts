import { PrismaService } from './../../../prisma/prisma.service';

export async function seedUserType(prisma: PrismaService) {
  console.log('Seeding user types...');

  const USER_TYPES = [
    {
      id: 1,
      type: 'super_admin',
      level: 100,
    },
    {
      id: 2,
      type: 'client',
      level: 10,
    },
    {
      id: 3,
      type: 'staff',
      level: 50,
    },
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
