/**
 * Contratos compartilhados entre a API (Express) e o site (Next.js).
 * Regra: só entra aqui o que os DOIS lados usam. Schemas de validação de entrada
 * vivem aqui para que o formulário do admin e o endpoint validem com a mesma regra.
 */
import { z } from 'zod';

/** Gera slug de URL a partir de um nome em português ("Fone Bluetooth Ágil" → "fone-bluetooth-agil"). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

export const slugSchema = z
  .string()
  .min(2)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens');

export const loginSchema = z.object({
  email: z.email().max(191),
  password: z.string().min(12).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Formato único de erro devolvido pela API. */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

/** Preço em centavos evita erro de ponto flutuante no transporte JSON. */
export type PriceCents = number;

export type PublicStore = { slug: string; name: string };

export type PublicOffer = {
  store: PublicStore;
  /** Redirecionamento da própria API (/go/:id): registra o clique e envia à loja. */
  goUrl: string;
  isPrimary: boolean;
  priceCents: PriceCents | null;
  /** Só existe quando há registro anterior real em price_history. */
  previousPriceCents: PriceCents | null;
  priceCheckedAt: string | null;
};

export type PublicProductCard = {
  slug: string;
  name: string;
  category: { slug: string; name: string };
  image: { url: string; alt: string } | null;
  primaryOffer: PublicOffer | null;
  isTrending: boolean;
  isFeatured: boolean;
};

/** Formata centavos em BRL: 8990 → "R$ 89,90". */
export function formatBRL(cents: PriceCents): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
