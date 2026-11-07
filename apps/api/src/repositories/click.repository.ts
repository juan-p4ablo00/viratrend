import { prisma } from '../config/db.js';

const since = (days: number) => new Date(Date.now() - days * 86_400_000);

export const clickRepository = {
  /** Link + o necessário para decidir o redirecionamento. */
  findLinkForRedirect: (id: number) =>
    prisma.affiliateLink.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        isActive: true,
        productId: true,
        storeId: true,
        store: { select: { isActive: true } },
        product: { select: { slug: true, status: true } },
      },
    }),

  record: (data: {
    affiliateLinkId: number;
    productId: number;
    storeId: number;
    referrerHost: string | null;
    utmSource: string | null;
  }) => prisma.click.create({ data }),

  /** IDs de produto mais clicados no período. */
  topProductIds: async (days: number, take: number) => {
    const rows = await prisma.click.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since(days) } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take,
    });
    return rows.map((r) => ({ productId: r.productId, clicks: r._count._all }));
  },

  dashboard: async () => {
    const [products, active, featured, trending, categories, clicksTotal, clicks30d, byStore] =
      await prisma.$transaction([
        prisma.product.count({ where: { status: { not: 'ARCHIVED' } } }),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count({ where: { status: 'ACTIVE', isFeatured: true } }),
        prisma.product.count({ where: { status: 'ACTIVE', isTrending: true } }),
        prisma.category.count(),
        prisma.click.count(),
        prisma.click.count({ where: { createdAt: { gte: since(30) } } }),
        prisma.click.groupBy({
          by: ['storeId'],
          where: { createdAt: { gte: since(30) } },
          _count: { _all: true },
          orderBy: { storeId: 'asc' },
        }),
      ]);
    return { products, active, featured, trending, categories, clicksTotal, clicks30d, byStore };
  },
};
