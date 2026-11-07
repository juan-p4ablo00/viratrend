import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type { LoginInput } from '@viratrend/shared';
import { env } from '../config/env.js';
import { authRepository } from '../repositories/auth.repository.js';
import type { Role } from '../generated/prisma/client.js';
import { HttpError } from '../utils/http-error.js';

export type AuthUser = { id: number; email: string; name: string; role: Role };

/** O banco guarda só o SHA-256 do token: um dump do MySQL não vira sessão válida. */
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

// Hash fixo para comparar quando o e-mail não existe: o tempo de resposta não revela
// quais e-mails são de administradores.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= argon2.hash(randomBytes(16).toString('hex')));

export const authService = {
  /** Argon2id com os parâmetros padrão da lib (64 MiB, t=3, p=4) — recomendação OWASP. */
  hashPassword: (password: string) => argon2.hash(password, { type: argon2.argon2id }),

  async login({ email, password }: LoginInput) {
    const user = await authRepository.findUserByEmail(email);
    const ok = user
      ? await argon2.verify(user.passwordHash, password)
      : await argon2.verify(await getDummyHash(), password).then(() => false);
    if (!user || !ok || !user.isActive) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
    }
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3_600_000);
    await authRepository.createSession(hashToken(token), user.id, expiresAt);
    const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    return { token, expiresAt, user: authUser };
  },

  async resolveSession(token: string): Promise<AuthUser | null> {
    const session = await authRepository.findSession(hashToken(token));
    if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;
    const { id, email, name, role } = session.user;
    return { id, email, name, role };
  },

  logout: (token: string) => authRepository.deleteSession(hashToken(token)),
};
