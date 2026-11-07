import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { buildRouter } from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import { globalLimiter } from './middlewares/rate-limits.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // IDs BIGINT (price_history, clicks) viram string no JSON — JSON.stringify não aceita BigInt.
  app.set('json replacer', (_key: string, value: unknown) =>
    typeof value === 'bigint' ? value.toString() : value,
  );
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
  app.use(globalLimiter);

  app.use(buildRouter());

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
