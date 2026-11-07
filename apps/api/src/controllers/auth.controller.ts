import type { RequestHandler } from 'express';
import { loginSchema } from '@viratrend/shared';
import { getSessionToken, SESSION_COOKIE, sessionCookieOptions } from '../middlewares/auth.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  login: (async (req, res) => {
    const { token, expiresAt, user } = await authService.login(loginSchema.parse(req.body));
    res.cookie(SESSION_COOKIE, token, { ...sessionCookieOptions, expires: expiresAt });
    res.json({ user });
  }) satisfies RequestHandler,

  logout: (async (req, res) => {
    const token = getSessionToken(req.headers.cookie);
    if (token) await authService.logout(token);
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
    res.status(204).end();
  }) satisfies RequestHandler,

  me: ((_req, res) => {
    res.json({ user: res.locals.user });
  }) satisfies RequestHandler,
};
