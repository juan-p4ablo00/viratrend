import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const common = { standardHeaders: 'draft-8', legacyHeaders: false } as const;
const tooMany = (message: string) => ({ error: { code: 'RATE_LIMITED', message } });

/** Limite geral por IP para toda a API. */
export const globalLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 300,
  message: tooMany('Muitas requisições. Tente em instantes.'),
});

/**
 * Login: por IP+e-mail (protege uma conta específica) e por IP (protege contra varredura de
 * e-mails). Tentativas bem-sucedidas não contam.
 */
export const loginLimiters = [
  rateLimit({
    ...common,
    windowMs: 15 * 60_000,
    limit: 5,
    skipSuccessfulRequests: true,
    keyGenerator: (req) =>
      `${ipKeyGenerator(req.ip ?? '')}:${String(req.body?.email ?? '')
        .toLowerCase()
        .slice(0, 191)}`,
    message: tooMany('Muitas tentativas para este e-mail. Aguarde 15 minutos.'),
  }),
  rateLimit({
    ...common,
    windowMs: 15 * 60_000,
    limit: 30,
    skipSuccessfulRequests: true,
    message: tooMany('Muitas tentativas de login. Aguarde 15 minutos.'),
  }),
];

/**
 * Cliques em /go: acima de 20 por minuto do mesmo IP o visitante continua sendo levado à loja,
 * mas o clique deixa de ser contado — robô ou F5 repetido não inflam o dashboard.
 */
export const clickCountLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 20,
  handler: (_req, res, next) => {
    res.locals.skipClick = true;
    next();
  },
});
