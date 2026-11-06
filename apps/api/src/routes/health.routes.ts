import { Router } from 'express';
import { prisma } from '../config/db.js';

export const healthRouter = Router();

/** Liveness + checagem do MySQL. Usado pelo monitoramento e após cada deploy. */
healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});
