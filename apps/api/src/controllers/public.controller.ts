import type { RequestHandler } from 'express';
import { idParam, publicListQuery, slugSchema } from '@viratrend/shared';
import { categoryService } from '../services/catalog.service.js';
import { clickService } from '../services/click.service.js';
import { publicProductService } from '../services/product.service.js';
import { categoryRepository } from '../repositories/catalog.repository.js';

// Respostas públicas podem ficar em cache curto no CDN da Vercel/navegador.
const cache = (seconds: number) =>
  `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`;

export const publicController = {
  categories: (async (_req, res) => {
    res.set('Cache-Control', cache(300)).json({ items: await categoryService.listPublic() });
  }) satisfies RequestHandler,

  products: (async (req, res) => {
    res
      .set('Cache-Control', cache(60))
      .json(await publicProductService.list(publicListQuery.parse(req.query)));
  }) satisfies RequestHandler,

  product: (async (req, res) => {
    const slug = slugSchema.parse(req.params.slug);
    res.set('Cache-Control', cache(60)).json(await publicProductService.detail(slug));
  }) satisfies RequestHandler,

  sitemap: (async (_req, res) => {
    const [products, categories] = await Promise.all([
      publicProductService.sitemap(),
      categoryRepository.listPublic(),
    ]);
    res.set('Cache-Control', cache(3600)).json({
      products,
      categories: categories.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt })),
    });
  }) satisfies RequestHandler,

  /** GET /go/:id → registra clique e redireciona (302) para a loja. */
  go: (async (req, res) => {
    const parsed = idParam.safeParse(req.params);
    const target = parsed.success
      ? await clickService.resolve(parsed.data.id, {
          referer: req.get('referer'),
          utmSource: req.query.utm_source,
          track: !res.locals.skipClick,
        })
      : null;
    if (!target) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Link não encontrado' } });
      return;
    }
    // no-store: cada clique precisa chegar aqui; noindex: o redirecionamento não deve ser indexado.
    res
      .set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' })
      .redirect(302, target.url);
  }) satisfies RequestHandler,
};
