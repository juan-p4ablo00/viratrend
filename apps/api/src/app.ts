import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Atrás do proxy da Hostinger o IP real vem em X-Forwarded-For; sem isso o rate limit
  // trataria todos os visitantes como um só.
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet()); // API só devolve JSON/redirect: a CSP padrão do helmet basta.
  app.use(
    cors({
      origin: env.CORS_ORIGINS, // lista fechada; nunca "*" com credenciais
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  // Limite geral por IP. Rotas sensíveis (login) recebem limites próprios na Fase 3.
  app.use(
    rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }),
  );

  app.use('/health', healthRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
