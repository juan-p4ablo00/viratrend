import {
  OFFER_MAX_AGE_DAYS,
  slugify,
  type Paginated,
  type PublicListQuery,
  type PublicOffer,
  type PublicProductCard,
  type PublicProductDetail,
} from '@viratrend/shared';
import type { z } from 'zod';
import type {
  adminProductListQuery,
  imageCreateSchema,
  linkCreateSchema,
  linkUpdateSchema,
  priceCreateSchema,
  productCreateSchema,
  productUpdateSchema,
} from '@viratrend/shared';
import { env } from '../config/env.js';
import type { Prisma } from '../generated/prisma/client.js';
import { clickRepository } from '../repositories/click.repository.js';
import {
  productRepository,
  publicProductWhere,
  type CardRow,
  type DetailRow,
} from '../repositories/product.repository.js';
import { HttpError } from '../utils/http-error.js';

const offerCutoff = () => new Date(Date.now() - OFFER_MAX_AGE_DAYS * 86_400_000);

// ─── mapeamento para o contrato público ───────────────────────
type LinkRow = DetailRow['links'][number];

function toOffer(link: LinkRow): PublicOffer {
  const [latest, previous] = link.prices;
  // Preço anterior só se for real: o registro mais recente é o preço atual e o anterior era maior.
  const previousPriceCents =
    link.priceCents !== null &&
    latest?.priceCents === link.priceCents &&
    previous &&
    previous.priceCents > link.priceCents
      ? previous.priceCents
      : null;
  const verified =
    link.offerStatus === 'VERIFIED' && link.offerCheckedAt && link.offerCheckedAt >= offerCutoff();
  return {
    store: link.store,
    goUrl: `${env.PUBLIC_API_URL}/go/${link.id}`,
    isPrimary: link.isPrimary,
    priceCents: link.priceCents,
    previousPriceCents,
    priceCheckedAt: link.priceCheckedAt?.toISOString() ?? null,
    offerVerifiedAt: verified ? link.offerCheckedAt!.toISOString() : null,
  };
}

const toImage = (img: DetailRow['images'][number]) => ({
  url: img.url,
  alt: img.alt,
  width: img.width,
  height: img.height,
});

function toCard(p: CardRow | DetailRow): PublicProductCard {
  const primary = p.links.find((l) => l.isPrimary) ?? null;
  const image = p.images[0];
  return {
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    category: p.category,
    image: image ? toImage(image) : null,
    primaryOffer: primary ? toOffer(primary) : null,
    isTrending: p.isTrending,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt?.toISOString() ?? null,
  };
}

// ─── leitura pública ──────────────────────────────────────────
type SectionRule = {
  where?: Prisma.ProductWhereInput;
  orderBy: Prisma.ProductOrderByWithRelationInput[];
};
const recent: Prisma.ProductOrderByWithRelationInput[] = [{ publishedAt: 'desc' }, { id: 'desc' }];
const sections: Record<
  Exclude<PublicListQuery['section'], 'popular' | undefined>,
  () => SectionRule
> = {
  featured: () => ({ where: { isFeatured: true }, orderBy: recent }),
  trending: () => ({ where: { isTrending: true }, orderBy: [{ updatedAt: 'desc' }] }),
  recent: () => ({ orderBy: recent }),
  offers: () => ({
    where: {
      links: {
        some: {
          isActive: true,
          store: { isActive: true },
          offerStatus: 'VERIFIED',
          offerCheckedAt: { gte: offerCutoff() },
          priceCents: { not: null },
        },
      },
    },
    orderBy: [{ updatedAt: 'desc' }],
  }),
};

// ponytail: LIKE em 5 colunas; trocar por índice FULLTEXT quando o catálogo passar de ~5 mil itens.
const searchWhere = (q: string): Prisma.ProductWhereInput => ({
  OR: [
    { name: { contains: q } },
    { summary: { contains: q } },
    { keywords: { contains: q } },
    { description: { contains: q } },
    { category: { name: { contains: q } } },
  ],
});

export const publicProductService = {
  async list(query: PublicListQuery): Promise<Paginated<PublicProductCard>> {
    const { page, limit } = query;
    const filters: Prisma.ProductWhereInput[] = [publicProductWhere];
    if (query.category) filters.push({ category: { slug: query.category } });
    if (query.q) filters.push(searchWhere(query.q));

    if (query.section === 'popular') {
      // Mais clicados nos últimos 30 dias (dado real de clique, não "avaliação").
      const top = await clickRepository.topProductIds(30, 200);
      const rows = await productRepository.findCardsByIds(top.map((t) => t.productId));
      const byId = new Map(rows.map((r) => [r.id, r]));
      const ordered = top.map((t) => byId.get(t.productId)).filter((r): r is CardRow => !!r);
      const filtered = query.category
        ? ordered.filter((r) => r.category.slug === query.category)
        : ordered;
      return {
        items: filtered.slice((page - 1) * limit, page * limit).map(toCard),
        page,
        limit,
        total: filtered.length,
      };
    }

    const rule = query.section ? sections[query.section]() : { orderBy: recent };
    if (rule.where) filters.push(rule.where);
    const [rows, total] = await productRepository.listCards(
      { AND: filters },
      rule.orderBy,
      (page - 1) * limit,
      limit,
    );
    return { items: rows.map(toCard), page, limit, total };
  },

  async detail(slug: string): Promise<PublicProductDetail> {
    const p = await productRepository.findPublicBySlug(slug);
    if (!p) throw new HttpError(404, 'NOT_FOUND', 'Produto não encontrado');
    const [related] = await productRepository.listCards(
      { AND: [publicProductWhere, { categoryId: p.categoryId, id: { not: p.id } }] },
      recent,
      0,
      4,
    );
    return {
      ...toCard(p),
      description: p.description,
      curatorNote: p.curatorNote,
      images: p.images.map(toImage),
      offers: p.links.map(toOffer),
      related: related.map(toCard),
      updatedAt: p.updatedAt.toISOString(),
    };
  },

  sitemap: () => productRepository.sitemap(),
};

// ─── admin ────────────────────────────────────────────────────
type ProductCreate = z.infer<typeof productCreateSchema>;
type ProductUpdate = z.infer<typeof productUpdateSchema>;
type AdminListQuery = z.infer<typeof adminProductListQuery>;

async function assertCanPublish(id: number) {
  const r = await productRepository.publishReadiness(id);
  if (!r) throw new HttpError(404, 'NOT_FOUND', 'Produto não encontrado');
  const missing = [
    !r.category.isActive && 'categoria ativa',
    r._count.images === 0 && 'ao menos uma imagem',
    r._count.links === 0 && 'ao menos um link ativo de loja ativa',
  ].filter(Boolean);
  if (missing.length) {
    throw new HttpError(422, 'NOT_PUBLISHABLE', `Para publicar falta: ${missing.join(', ')}.`, {
      missing,
    });
  }
  return r;
}

export const adminProductService = {
  async list(q: AdminListQuery) {
    const where: Prisma.ProductWhereInput = {
      ...(q.status ? { status: q.status } : { status: { not: 'ARCHIVED' } }),
      ...(q.categoryId && { categoryId: q.categoryId }),
      ...(q.q && { OR: [{ name: { contains: q.q } }, { slug: { contains: q.q } }] }),
    };
    const [items, total] = await productRepository.adminList(
      where,
      (q.page - 1) * q.limit,
      q.limit,
    );
    return { items, page: q.page, limit: q.limit, total };
  },

  async get(id: number) {
    const p = await productRepository.adminFind(id);
    if (!p) throw new HttpError(404, 'NOT_FOUND', 'Produto não encontrado');
    return p;
  },

  create: (input: ProductCreate) =>
    productRepository.create({
      ...input,
      slug: input.slug ?? slugify(input.name),
      status: 'DRAFT',
    }),

  async update(id: number, input: ProductUpdate) {
    const data: Prisma.ProductUncheckedUpdateInput = { ...input };
    if (input.status === 'ACTIVE') {
      const r = await assertCanPublish(id);
      if (!r.publishedAt) data.publishedAt = new Date();
    }
    return productRepository.update(id, data);
  },

  /** "Excluir" no painel = arquivar: some do site, mantém cliques e histórico de preço. */
  archive: (id: number) =>
    productRepository.update(id, { status: 'ARCHIVED', isFeatured: false, isTrending: false }),

  addImage: (productId: number, input: z.infer<typeof imageCreateSchema>) =>
    productRepository.addImage({ ...input, productId }),

  deleteImage: (imageId: number) => productRepository.deleteImage(imageId),

  async addLink(productId: number, input: z.infer<typeof linkCreateSchema>) {
    const isFirst = (await productRepository.countLinks(productId)) === 0;
    return productRepository.saveLink(productId, (tx) =>
      tx.affiliateLink.create({
        data: {
          productId,
          storeId: input.storeId,
          url: input.url,
          isPrimary: input.isPrimary || isFirst,
        },
      }),
    );
  },

  async updateLink(linkId: number, input: z.infer<typeof linkUpdateSchema>) {
    const link = await productRepository.findLink(linkId);
    if (!link) throw new HttpError(404, 'NOT_FOUND', 'Link não encontrado');
    if (input.offerStatus === 'VERIFIED' && link.priceCents === null) {
      throw new HttpError(
        422,
        'PRICE_REQUIRED',
        'Registre o preço conferido antes de marcar a oferta.',
      );
    }
    if (input.isActive === false && input.isPrimary) {
      throw new HttpError(422, 'INVALID', 'Um link desativado não pode ser o principal.');
    }

    return productRepository.saveLink(link.productId, async (tx) => {
      const data: Prisma.AffiliateLinkUpdateInput = { ...input };
      if (input.offerStatus === 'VERIFIED') data.offerCheckedAt = new Date();
      if (input.isActive === false && link.isPrimary) {
        // Desativar o principal promove outro link ativo (se houver).
        data.isPrimary = false;
        const next = await tx.affiliateLink.findFirst({
          where: { productId: link.productId, isActive: true, id: { not: link.id } },
          orderBy: { id: 'asc' },
        });
        if (next)
          await tx.affiliateLink.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
      return tx.affiliateLink.update({ where: { id: link.id }, data });
    });
  },

  async recordPrice(linkId: number, input: z.infer<typeof priceCreateSchema>, userId: number) {
    const link = await productRepository.findLink(linkId);
    if (!link) throw new HttpError(404, 'NOT_FOUND', 'Link não encontrado');
    return productRepository.recordPrice(linkId, input.priceCents, input.source ?? null, userId);
  },

  priceHistory: (linkId: number) => productRepository.priceHistory(linkId),
};
