import { PrismaService } from '../../../prisma/prisma.service';

export async function seedRole(prisma: PrismaService) {
  console.log('Seeding role...');

  const ROLE = [
    {
      id: 1,
      role_name: 'Super Admin',
      role_desc: '',
      user_type_id: 1,
      created_by: 1,
    },
  ];

  for (const item of ROLE) {
    return await prisma.role.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
}
