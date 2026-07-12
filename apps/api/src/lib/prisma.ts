import { PrismaClient } from '@prisma/client';

const _prisma = new PrismaClient();

export const prisma = Object.assign(_prisma, {
  user: Object.assign(_prisma.user, {
    async findByEmail(email: string) {
      return _prisma.user.findUnique({ where: { email } });
    },
  }),
  registration: Object.assign(_prisma.registration, {
    async findByUserAndEvent(userId: string, eventId: string) {
      return _prisma.registration.findFirst({ where: { userId, eventId } });
    },
    async findByUniqueRegistrationId(uniqueRegistrationId: string) {
      return _prisma.registration.findUnique({ where: { uniqueRegistrationId } });
    },
  }),
});
