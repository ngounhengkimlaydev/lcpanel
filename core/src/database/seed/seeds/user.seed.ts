import { HashService } from './../../../common/utils/hash/hash.service';
import { PrismaService } from '../../../prisma/prisma.service';

const hashService = new HashService();

function generatePassword(length = 8) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

const SEED_USERS = [
  {
    full_name: 'Admin',
    username: 'admin',
    status: 1,
    role_id: 1,
    user_type_id: 1,
  },
];

export async function seedUsers(prisma: PrismaService) {
  console.log('🌱 Seeding users...');

  for (const user of SEED_USERS) {
    const exists = await prisma.user.findFirst({
      where: { username: user.username },
    });

    if (exists) {
      console.log(`⏭️  User "${user.username}" already exists, skipping.`);
      continue;
    }

    const plainPassword = generatePassword(8);

    await prisma.user.create({
      data: {
        ...user,
        password: await hashService.hash(plainPassword),
      },
    });

    console.log(`✅ User created`);
    console.log(`🔑 Username: ${user.username}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log('---------------------------');
  }

  console.log('✅ Users seeded');
}
