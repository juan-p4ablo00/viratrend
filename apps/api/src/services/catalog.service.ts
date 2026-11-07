import { slugify, type PublicCategory } from '@viratrend/shared';
import type { z } from 'zod';
import type {
  categoryCreateSchema,
  categoryUpdateSchema,
  storeCreateSchema,
  storeUpdateSchema,
} from '@viratrend/shared';
import { categoryRepository, storeRepository } from '../repositories/catalog.repository.js';
import { HttpError } from '../utils/http-error.js';

type CategoryCreate = z.infer<typeof categoryCreateSchema>;
type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;
type StoreCreate = z.infer<typeof storeCreateSchema>;
type StoreUpdate = z.infer<typeof storeUpdateSchema>;

export const categoryService = {
  listAdmin: () => categoryRepository.listAll(),

  async listPublic(): Promise<PublicCategory[]> {
    const rows = await categoryRepository.listPublic();
    return rows.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    }));
  },

  create: (input: CategoryCreate) =>
    categoryRepository.create({ ...input, slug: input.slug ?? slugify(input.name) }),

  update: (id: number, input: CategoryUpdate) => categoryRepository.update(id, input),

  /** Exclusão física só para categoria vazia; com produtos, o caminho é desativar. */
  async remove(id: number) {
    const count = await categoryRepository.countProducts(id);
    if (count > 0) {
      throw new HttpError(
        409,
        'CATEGORY_IN_USE',
        `A categoria tem ${count} produto(s). Mova-os ou desative a categoria.`,
      );
    }
    await categoryRepository.delete(id);
  },
};

export const storeService = {
  list: () => storeRepository.listAll(),
  create: (input: StoreCreate) =>
    storeRepository.create({ ...input, slug: input.slug ?? slugify(input.name) }),
  update: (id: number, input: StoreUpdate) => storeRepository.update(id, input),
};
