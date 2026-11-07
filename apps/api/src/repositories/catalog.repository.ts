import { prisma } from '../config/db.js';
import type { Prisma } from '../generated/prisma/client.js';

const ACTIVE_PRODUCT = { status: 'ACTIVE' } as const;

export const categoryRepository = {
  listAll: () =>
    prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    }),

  listPublic: () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: ACTIVE_PRODUCT } } } },
    }),

  findById: (id: number) => prisma.category.findUnique({ where: { id } }),
  create: (data: Prisma.CategoryCreateInput) => prisma.category.create({ data }),
  update: (id: number, data: Prisma.CategoryUpdateInput) =>
    prisma.category.update({ where: { id }, data }),
  countProducts: (id: number) => prisma.product.count({ where: { categoryId: id } }),
  delete: (id: number) => prisma.category.delete({ where: { id } }),
};

export const storeRepository = {
  listAll: () => prisma.store.findMany({ orderBy: { name: 'asc' } }),
  findById: (id: number) => prisma.store.findUnique({ where: { id } }),
  create: (data: Prisma.StoreCreateInput) => prisma.store.create({ data }),
  update: (id: number, data: Prisma.StoreUpdateInput) =>
    prisma.store.update({ where: { id }, data }),
};
