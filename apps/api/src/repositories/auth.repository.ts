import { prisma } from '../config/db.js';
import type { Role } from '../generated/prisma/client.js';

export const authRepository = {
  findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  createUser: (data: { email: string; name: string; passwordHash: string; role: Role }) =>
    prisma.user.create({ data }),

  createSession: (id: string, userId: number, expiresAt: Date) =>
    prisma.$transaction([
      // Limpeza oportunista: sessões vencidas somem a cada login.
      prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
      prisma.session.create({ data: { id, userId, expiresAt } }),
      prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } }),
    ]),

  findSession: (id: string) =>
    prisma.session.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, role: true, isActive: true } },
      },
    }),

  deleteSession: (id: string) => prisma.session.deleteMany({ where: { id } }),
};
