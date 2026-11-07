/**
 * Cria (ou reativa com nova senha) um usuário do painel. Não existe cadastro público.
 *
 *   npm run admin:create -w @viratrend/api -- --email voce@exemplo.com --name "Seu Nome" [--role EDITOR]
 *
 * A senha é pedida no terminal (ou lida de ADMIN_PASSWORD) — nunca como argumento,
 * para não ficar no histórico do shell.
 */
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { passwordSchema } from '@viratrend/shared';
import { prisma } from '../config/db.js';
import { authService } from '../services/auth.service.js';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string', default: 'ADMIN' },
  },
});
const input = z
  .object({
    email: z.email().transform((e) => e.toLowerCase()),
    name: z.string().trim().min(2).max(120),
    role: z.enum(['ADMIN', 'EDITOR']),
  })
  .parse(values);

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question('Senha (mín. 12 caracteres): ');
  rl.close();
}
const passwordHash = await authService.hashPassword(passwordSchema.parse(password));

const user = await prisma.user.upsert({
  where: { email: input.email },
  update: { passwordHash, name: input.name, role: input.role, isActive: true },
  create: { ...input, passwordHash },
});
// Troca de senha derruba as sessões abertas.
await prisma.session.deleteMany({ where: { userId: user.id } });
console.log(`Usuário ${user.email} (${user.role}) pronto.`);
await prisma.$disconnect();
