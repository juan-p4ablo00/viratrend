import { Router } from 'express';
import { adminController as a } from '../controllers/admin.controller.js';
import { authController } from '../controllers/auth.controller.js';
import { publicController as p } from '../controllers/public.controller.js';
import { requireAuth, requireRole, requireTrustedOrigin } from '../middlewares/auth.js';
import { clickCountLimiter, loginLimiters } from '../middlewares/rate-limits.js';
import { healthRouter } from './health.routes.js';

/** Mapa completo de rotas. Tudo sob /admin exige sessão; mutações exigem origem confiável. */
export function buildRouter() {
  const router = Router();
  router.use('/health', healthRouter);

  // ─── públicas (somente leitura) ─────────────────────────────
  router.get('/public/categories', p.categories);
  router.get('/public/products', p.products);
  router.get('/public/products/:slug', p.product);
  router.get('/public/sitemap', p.sitemap);
  router.get('/go/:id', clickCountLimiter, p.go);

  // ─── autenticação ───────────────────────────────────────────
  const auth = Router();
  auth.use(requireTrustedOrigin);
  auth.post('/login', ...loginLimiters, authController.login);
  auth.post('/logout', authController.logout);
  auth.get('/me', requireAuth(), authController.me);
  router.use('/auth', auth);

  // ─── painel (ADMIN e EDITOR cuidam do catálogo) ─────────────
  const admin = Router();
  admin.use(requireTrustedOrigin, requireAuth('ADMIN', 'EDITOR'));
  admin.get('/dashboard', a.dashboard);

  admin.get('/categories', a.listCategories);
  admin.post('/categories', a.createCategory);
  admin.patch('/categories/:id', a.updateCategory);
  admin.delete('/categories/:id', requireRole('ADMIN'), a.deleteCategory);

  admin.get('/stores', a.listStores);
  admin.post('/stores', requireRole('ADMIN'), a.createStore);
  admin.patch('/stores/:id', requireRole('ADMIN'), a.updateStore);

  admin.get('/products', a.listProducts);
  admin.post('/products', a.createProduct);
  admin.get('/products/:id', a.getProduct);
  admin.patch('/products/:id', a.updateProduct);
  admin.delete('/products/:id', a.archiveProduct);

  admin.post('/products/:id/images', a.addImage);
  admin.delete('/images/:id', a.deleteImage);

  admin.post('/products/:id/links', a.addLink);
  admin.patch('/links/:id', a.updateLink);
  admin.get('/links/:id/prices', a.priceHistory);
  admin.post('/links/:id/prices', a.recordPrice);
  router.use('/admin', admin);

  return router;
}
