import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

// Pool pequeno de propósito: hospedagem compartilhada limita conexões simultâneas por usuário MySQL.
// Ajuste DATABASE_POOL_SIZE conforme o limite real do plano (ver docs/ARCHITECTURE.md §7).
const url = new URL(env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: env.DATABASE_POOL_SIZE,
});

export const prisma = new PrismaClient({ adapter });
