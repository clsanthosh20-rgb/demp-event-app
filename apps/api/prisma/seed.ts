import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('leodas', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demp.local' },
    update: { passwordHash },
    create: {
      email: 'admin@demp.local',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@demp.local' },
    update: { passwordHash },
    create: {
      email: 'student@demp.local',
      passwordHash,
      name: 'Student',
      role: 'STUDENT',
    },
  });

  console.log('Seeded admin:', admin.email);
  console.log('Seeded student:', student.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
