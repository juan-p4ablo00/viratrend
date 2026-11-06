import { z } from 'zod';

/**
 * Única porta de entrada das variáveis de ambiente. Falha no boot (não no meio de uma
 * requisição) se algo obrigatório faltar. Nenhum valor daqui é logado.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().startsWith('mysql://'),
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(50).default(5),
  /** Origens com permissão de CORS (o site). Separadas por vírgula. */
  CORS_ORIGINS: z.string().transform((s) =>
    s
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ),
  /** Domínio do cookie de sessão em produção (ex.: .viratrend.com.br). Vazio = host atual. */
  COOKIE_DOMAIN: z.string().optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(12),
  /** URL pública da própria API, usada para montar os links /go/:id. */
  PUBLIC_API_URL: z.url(),
  /** Quantos proxies existem na frente do Express (Hostinger usa 1). Afeta o IP do rate limit. */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Só nomes das variáveis, nunca valores.
  console.error(
    'Variáveis de ambiente inválidas:',
    Object.keys(z.flattenError(parsed.error).fieldErrors),
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
