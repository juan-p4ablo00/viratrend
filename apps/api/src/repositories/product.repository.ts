import { prisma } from '../config/db.js';
import type { Prisma } from '../generated/prisma/client.js';

/** Produto visível no site: publicado e com categoria ativa. */
export const publicProductWhere: Prisma.ProductWhereInput = {
  status: 'ACTIVE',
  category: { isActive: true },
};

/** Links que podem receber clique: ativos e com loja ativa. */
const usableLink: Prisma.AffiliateLinkWhereInput = { isActive: true, store: { isActive: true } };

/** Últimos 2 preços bastam: o atual e o imediatamente anterior. */
const linkInclude = {
  store: { select: { slug: true, name: true } },
  prices: { orderBy: { checkedAt: 'desc' }, take: 2, select: { priceCents: true } },
} satisfies Prisma.AffiliateLinkInclude;

export const cardInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
  links: { where: { ...usableLink, isPrimary: true }, include: linkInclude, take: 1 },
} satisfies Prisma.ProductInclude;

export const detailInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  links: {
    where: usableLink,
    include: linkInclude,
    orderBy: [{ isPrimary: 'desc' }, { priceCents: 'asc' }],
  },
} satisfies Prisma.ProductInclude;

export type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;
export type DetailRow = Prisma.ProductGetPayload<{ include: typeof detailInclude }>;

export const productRepository = {
  // ─── leitura pública ─────────────────────────────────────────
  listCards: (
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput[],
    skip: number,
    take: number,
  ) =>
    prisma.$transaction([
      prisma.product.findMany({ where, orderBy, skip, take, include: cardInclude }),
      prisma.product.count({ where }),
    ]),

  findCardsByIds: (ids: number[]) =>
    prisma.product.findMany({
      where: { ...publicProductWhere, id: { in: ids } },
      include: cardInclude,
    }),

  findPublicBySlug: (slug: string) =>
    prisma.product.findFirst({ where: { ...publicProductWhere, slug }, include: detailInclude }),

  sitemap: () =>
    prisma.product.findMany({
      where: publicProductWhere,
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),

  // ─── admin ───────────────────────────────────────────────────
  adminList: (where: Prisma.ProductWhereInput, skip: number, take: number) =>
    prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { images: true, links: true, clicks: true } },
          links: {
            where: { isPrimary: true },
            select: { priceCents: true, store: { select: { name: true } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]),

  adminFind: (id: number) =>
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        links: { include: { store: true }, orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }] },
      },
    }),

  create: (data: Prisma.ProductUncheckedCreateInput) => prisma.product.create({ data }),
  update: (id: number, data: Prisma.ProductUncheckedUpdateInput) =>
    prisma.product.update({ where: { id }, data }),

  /** Requisitos para publicar: imagem e ao menos um link utilizável. */
  publishReadiness: (id: number) =>
    prisma.product.findUnique({
      where: { id },
      select: {
        publishedAt: true,
        category: { select: { isActive: true } },
        _count: { select: { images: true, links: { where: usableLink } } },
      },
    }),

  // ─── imagens ─────────────────────────────────────────────────
  addImage: (data: Prisma.ProductImageUncheckedCreateInput) => prisma.productImage.create({ data }),
  deleteImage: (id: number) => prisma.productImage.delete({ where: { id } }),

  // ─── links e preços ──────────────────────────────────────────
  findLink: (id: number) => prisma.affiliateLink.findUnique({ where: { id } }),
  countLinks: (productId: number) => prisma.affiliateLink.count({ where: { productId } }),

  /** Cria/atualiza um link garantindo no máximo um principal por produto (transação). */
  async saveLink(
    productId: number,
    write: (tx: Prisma.TransactionClient) => Promise<{ id: number; isPrimary: boolean }>,
  ) {
    return prisma.$transaction(async (tx) => {
      const link = await write(tx);
      if (link.isPrimary) {
        await tx.affiliateLink.updateMany({
          where: { productId, id: { not: link.id }, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.affiliateLink.findUniqueOrThrow({
        where: { id: link.id },
        include: { store: true },
      });
    });
  },

  /** Preço novo: atualiza o link E grava no histórico (nunca sobrescreve o histórico). */
  recordPrice: (linkId: number, priceCents: number, source: string | null, userId: number) =>
    prisma.$transaction(async (tx) => {
      const now = new Date();
      const entry = await tx.priceHistory.create({
        data: { affiliateLinkId: linkId, priceCents, source, recordedById: userId, checkedAt: now },
      });
      await tx.affiliateLink.update({
        where: { id: linkId },
        data: { priceCents, priceCheckedAt: now },
      });
      return entry;
    }),

  priceHistory: (linkId: number) =>
    prisma.priceHistory.findMany({
      where: { affiliateLinkId: linkId },
      orderBy: { checkedAt: 'desc' },
      take: 100,
      include: { recordedBy: { select: { name: true } } },
    }),
};
