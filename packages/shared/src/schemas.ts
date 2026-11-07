/**
 * Schemas de entrada. O painel (Next) e a API (Express) validam com estes mesmos objetos;
 * a API é quem decide — o front só antecipa a mensagem de erro.
 */
import { z } from 'zod';

// Mensagens de validação em português do Brasil — vale para o painel e para a API
// (os dois usam a mesma instância do Zod, via este pacote).
z.config(z.locales.ptBR());

export const slugSchema = z
  .string()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens');

/** Só HTTPS: links e imagens saem da plataforma para o visitante. */
export const httpsUrl = z.url({ protocol: /^https$/, error: 'Use uma URL https://' }).max(2048);

const nullableText = (max: number) => z.string().trim().max(max).nullish();
const id = z.coerce
  .number({ error: 'Escolha uma opção' })
  .int()
  .positive({ error: 'Escolha uma opção' });

export const idParam = z.object({ id });

// ─── Auth ──────────────────────────────────────────────────────
export const passwordSchema = z.string().min(12, 'Mínimo de 12 caracteres').max(200);
export const loginSchema = z.object({
  email: z
    .email()
    .max(191)
    .transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Sem .default() nos schemas de entidade: no Zod 4, .partial() preserva defaults, e um PATCH
// parcial sobrescreveria campos não enviados. Os valores padrão ficam no banco (schema.prisma).

// ─── Categorias e lojas ────────────────────────────────────────
export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema.optional(),
  description: nullableText(500),
  imageUrl: httpsUrl.max(1000).nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const storeCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugSchema.optional(),
  websiteUrl: httpsUrl.max(500),
  isActive: z.boolean().optional(),
});
export const storeUpdateSchema = storeCreateSchema.partial();

// ─── Produtos ──────────────────────────────────────────────────
export const productStatus = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export const offerStatus = z.enum(['NONE', 'VERIFIED', 'EXPIRED']);

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: slugSchema.optional(),
  summary: nullableText(300),
  description: z.string().trim().min(1).max(20000),
  curatorNote: nullableText(5000),
  keywords: nullableText(500),
  categoryId: id,
  // Produto nasce rascunho; publicar é uma decisão explícita (PATCH status=ACTIVE).
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
});
export const productUpdateSchema = productCreateSchema.partial().extend({
  status: productStatus.optional(),
});

export const imageCreateSchema = z.object({
  url: httpsUrl.max(1000),
  alt: z.string().trim().min(2).max(200),
  width: z.number().int().positive().max(10000).nullish(),
  height: z.number().int().positive().max(10000).nullish(),
  sortOrder: z.number().int().min(0).max(99).optional(),
  credit: nullableText(200),
});

export const linkCreateSchema = z.object({
  storeId: id,
  url: httpsUrl,
  isPrimary: z.boolean().optional(),
});
export const linkUpdateSchema = z.object({
  url: httpsUrl.optional(),
  isPrimary: z.literal(true).optional(), // "deixar de ser principal" = marcar outro como principal
  isActive: z.boolean().optional(),
  offerStatus: offerStatus.optional(),
});

export const priceCreateSchema = z.object({
  priceCents: z.number().int().positive().max(100_000_000),
  source: nullableText(300),
});

// ─── Listagens ─────────────────────────────────────────────────
export const publicSections = ['featured', 'trending', 'recent', 'offers', 'popular'] as const;
export const publicListQuery = z.object({
  section: z.enum(publicSections).optional(),
  category: slugSchema.optional(),
  q: z.string().trim().min(2).max(80).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
export type PublicListQuery = z.infer<typeof publicListQuery>;

export const adminProductListQuery = z.object({
  status: productStatus.optional(),
  categoryId: id.optional(),
  q: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
