import type { CookieOptions, RequestHandler } from 'express';
import { env, isProd } from '../config/env.js';
import { authService, type AuthUser } from '../services/auth.service.js';
import type { Role } from '../generated/prisma/client.js';
import { HttpError } from '../utils/http-error.js';

/**
 * Em produção o prefixo __Host- obriga Secure + Path=/ + sem Domain: o cookie só vale para
 * o host da API e não pode ser plantado por um subdomínio. SameSite=Lax basta porque site e
 * API ficam no mesmo domínio-raiz (viratrend.com.br / api.viratrend.com.br).
 */
export const SESSION_COOKIE = isProd ? '__Host-vt_session' : 'vt_session';
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

/** Lê um cookie do header sem dependência extra. */
export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq).trim() === name)
      return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

export const getSessionToken = (cookieHeader: string | undefined) =>
  readCookie(cookieHeader, SESSION_COOKIE);

/** Exige sessão válida e, se informado, um dos papéis. Coloca o usuário em res.locals.user. */
export function requireAuth(...roles: Role[]): RequestHandler {
  return async (req, res, next) => {
    const token = getSessionToken(req.headers.cookie);
    const user = token ? await authService.resolveSession(token) : null;
    if (!user) throw new HttpError(401, 'UNAUTHENTICATED', 'Faça login para continuar');
    if (roles.length && !roles.includes(user.role)) {
      throw new HttpError(403, 'FORBIDDEN', 'Sem permissão para esta ação');
    }
    res.locals.user = user satisfies AuthUser;
    next();
  };
}

/**
 * Defesa CSRF além do SameSite: requisições que alteram dados precisam vir de uma origem
 * conhecida. Navegadores sempre enviam Origin em POST/PATCH/DELETE via fetch.
 */
export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin || !env.CORS_ORIGINS.includes(origin)) {
    throw new HttpError(403, 'BAD_ORIGIN', 'Origem não permitida');
  }
  next();
};

/** Depois de requireAuth(): restringe a rota a papéis específicos sem consultar a sessão de novo. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (_req, res, next) => {
    if (!roles.includes((res.locals.user as AuthUser).role)) {
      throw new HttpError(403, 'FORBIDDEN', 'Sem permissão para esta ação');
    }
    next();
  };
}
