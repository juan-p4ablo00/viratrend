import type { RequestHandler } from 'express';
import {
  adminProductListQuery,
  categoryCreateSchema,
  categoryUpdateSchema,
  idParam,
  imageCreateSchema,
  linkCreateSchema,
  linkUpdateSchema,
  priceCreateSchema,
  productCreateSchema,
  productUpdateSchema,
  storeCreateSchema,
  storeUpdateSchema,
} from '@viratrend/shared';
import type { AuthUser } from '../services/auth.service.js';
import { categoryService, storeService } from '../services/catalog.service.js';
import { clickService } from '../services/click.service.js';
import { adminProductService } from '../services/product.service.js';

/** Controllers só traduzem HTTP ↔ serviço: validam entrada com Zod e devolvem JSON. */
const id = (req: { params: unknown }) => idParam.parse(req.params).id;
const handler = (fn: RequestHandler) => fn;

export const adminController = {
  dashboard: handler(async (_req, res) => {
    res.json(await clickService.dashboard());
  }),

  // categorias
  listCategories: handler(async (_req, res) => {
    res.json({ items: await categoryService.listAdmin() });
  }),
  createCategory: handler(async (req, res) => {
    res.status(201).json(await categoryService.create(categoryCreateSchema.parse(req.body)));
  }),
  updateCategory: handler(async (req, res) => {
    res.json(await categoryService.update(id(req), categoryUpdateSchema.parse(req.body)));
  }),
  deleteCategory: handler(async (req, res) => {
    await categoryService.remove(id(req));
    res.status(204).end();
  }),

  // lojas
  listStores: handler(async (_req, res) => {
    res.json({ items: await storeService.list() });
  }),
  createStore: handler(async (req, res) => {
    res.status(201).json(await storeService.create(storeCreateSchema.parse(req.body)));
  }),
  updateStore: handler(async (req, res) => {
    res.json(await storeService.update(id(req), storeUpdateSchema.parse(req.body)));
  }),

  // produtos
  listProducts: handler(async (req, res) => {
    res.json(await adminProductService.list(adminProductListQuery.parse(req.query)));
  }),
  getProduct: handler(async (req, res) => {
    res.json(await adminProductService.get(id(req)));
  }),
  createProduct: handler(async (req, res) => {
    res.status(201).json(await adminProductService.create(productCreateSchema.parse(req.body)));
  }),
  updateProduct: handler(async (req, res) => {
    res.json(await adminProductService.update(id(req), productUpdateSchema.parse(req.body)));
  }),
  archiveProduct: handler(async (req, res) => {
    await adminProductService.archive(id(req));
    res.status(204).end();
  }),

  // imagens
  addImage: handler(async (req, res) => {
    res
      .status(201)
      .json(await adminProductService.addImage(id(req), imageCreateSchema.parse(req.body)));
  }),
  deleteImage: handler(async (req, res) => {
    await adminProductService.deleteImage(id(req));
    res.status(204).end();
  }),

  // links e preços
  addLink: handler(async (req, res) => {
    res
      .status(201)
      .json(await adminProductService.addLink(id(req), linkCreateSchema.parse(req.body)));
  }),
  updateLink: handler(async (req, res) => {
    res.json(await adminProductService.updateLink(id(req), linkUpdateSchema.parse(req.body)));
  }),
  recordPrice: handler(async (req, res) => {
    const user = res.locals.user as AuthUser;
    res
      .status(201)
      .json(
        await adminProductService.recordPrice(id(req), priceCreateSchema.parse(req.body), user.id),
      );
  }),
  priceHistory: handler(async (req, res) => {
    res.json({ items: await adminProductService.priceHistory(id(req)) });
  }),
};
