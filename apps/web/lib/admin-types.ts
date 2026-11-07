/** Formas das respostas /admin/* da API (espelham os includes do Prisma em apps/api). */
export type Role = 'ADMIN' | 'EDITOR';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type OfferStatus = 'NONE' | 'VERIFIED' | 'EXPIRED';

export type AdminUser = { id: number; email: string; name: string; role: Role };

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
};

export type Store = {
  id: number;
  slug: string;
  name: string;
  websiteUrl: string;
  isActive: boolean;
};

export type ProductImage = {
  id: number;
  url: string;
  alt: string;
  credit: string | null;
  sortOrder: number;
};

export type AffiliateLink = {
  id: number;
  url: string;
  isPrimary: boolean;
  isActive: boolean;
  priceCents: number | null;
  priceCheckedAt: string | null;
  offerStatus: OfferStatus;
  offerCheckedAt: string | null;
  store: Store;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  summary: string | null;
  description: string;
  curatorNote: string | null;
  keywords: string | null;
  categoryId: number;
  status: ProductStatus;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  updatedAt: string;
  category: Category;
  images: ProductImage[];
  links: AffiliateLink[];
};

export type AdminProductRow = {
  id: number;
  slug: string;
  name: string;
  status: ProductStatus;
  isFeatured: boolean;
  isTrending: boolean;
  updatedAt: string;
  category: { id: number; name: string };
  _count: { images: number; links: number; clicks: number };
  links: { priceCents: number | null; store: { name: string } }[];
};

export type PriceEntry = {
  id: string;
  priceCents: number;
  checkedAt: string;
  source: string | null;
  recordedBy: { name: string } | null;
};

export type Dashboard = {
  products: { total: number; active: number; featured: number; trending: number };
  categories: number;
  clicks: { total: number; last30d: number; byStore30d: { store: string; clicks: number }[] };
  topProducts30d: { productId: number; clicks: number; name?: string; slug?: string }[];
};

export const statusLabel: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Publicado',
  ARCHIVED: 'Arquivado',
};
export const offerLabel: Record<OfferStatus, string> = {
  NONE: 'Sem oferta',
  VERIFIED: 'Oferta conferida',
  EXPIRED: 'Oferta expirada',
};
