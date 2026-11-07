/**
 * Contratos compartilhados entre a API (Express) e o site (Next.js).
 * Regra: só entra aqui o que os DOIS lados usam.
 */
export * from './schemas.js';

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

/** Formata centavos em BRL: 8990 → "R$ 89,90". */
export function formatBRL(cents: PriceCents): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/**
 * Converte o que o editor digita em centavos: "89,90" → 8990, "1.299,90" → 129990, "59" → 5900.
 * Retorna null para entrada inválida (letras, mais de 2 casas, negativo).
 */
export function parseBRLToCents(input: string): number | null {
  const raw = input.trim().replace(/^R\$\s*/, '');
  // Ponto só como separador de milhar em grupos de 3 ("1.299"); "12.5" é ambíguo e é recusado.
  if (!/^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/.test(raw)) return null;
  const m = /^(\d{1,9})(?:,(\d{1,2}))?$/.exec(raw.replace(/\./g, ''));
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '0').padEnd(2, '0'));
  return cents > 0 ? cents : null;
}

/** Uma oferta só é exibida como "conferida" até N dias após a última conferência. */
export const OFFER_MAX_AGE_DAYS = 7;

/** Formato único de erro devolvido pela API. */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

export type Paginated<T> = { items: T[]; page: number; limit: number; total: number };

/** Preço em centavos evita erro de ponto flutuante no transporte JSON. */
export type PriceCents = number;

export type PublicStore = { slug: string; name: string };
export type PublicCategory = {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
};
export type PublicImage = { url: string; alt: string; width: number | null; height: number | null };

export type PublicOffer = {
  store: PublicStore;
  /** Redirecionamento da própria API (/go/:id): registra o clique e envia à loja. */
  goUrl: string;
  isPrimary: boolean;
  priceCents: PriceCents | null;
  /** Só existe quando há registro anterior real e maior em price_history. */
  previousPriceCents: PriceCents | null;
  priceCheckedAt: string | null;
  /** Preenchido só se a oferta foi conferida nos últimos OFFER_MAX_AGE_DAYS dias. */
  offerVerifiedAt: string | null;
};

export type PublicProductCard = {
  slug: string;
  name: string;
  summary: string | null;
  category: { slug: string; name: string };
  image: PublicImage | null;
  primaryOffer: PublicOffer | null;
  isTrending: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
};

export type PublicProductDetail = PublicProductCard & {
  description: string;
  curatorNote: string | null;
  images: PublicImage[];
  offers: PublicOffer[];
  related: PublicProductCard[];
  updatedAt: string;
};
