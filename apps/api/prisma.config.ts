import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma 7 não carrega .env sozinho. Em produção (Hostinger) as variáveis vêm do painel.
// Só carrega o .env se a URL não veio de fora (testes e produção definem a própria).
if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --env-file=.env prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL, // só migrate/seed precisam; generate roda sem
  },
});
