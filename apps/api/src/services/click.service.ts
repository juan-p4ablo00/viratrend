import { env } from '../config/env.js';
import { clickRepository } from '../repositories/click.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { storeRepository } from '../repositories/catalog.repository.js';

/** Só o host de origem (ex.: "www.tiktok.com"), nunca a URL completa. */
function referrerHost(referer: string | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.slice(0, 191) || null;
  } catch {
    return null;
  }
}

const cleanUtm = (v: unknown) =>
  typeof v === 'string' && /^[\w.-]{1,100}$/.test(v) ? v.toLowerCase() : null;

export const clickService = {
  /**
   * Decide para onde mandar o visitante e registra o clique.
   * Link indisponível com produto conhecido → volta para a página do produto no site.
   */
  async resolve(linkId: number, meta: { referer?: string; utmSource?: unknown; track?: boolean }) {
    const link = await clickRepository.findLinkForRedirect(linkId);
    if (!link) return null;
    const usable = link.isActive && link.store.isActive && link.product.status === 'ACTIVE';
    if (!usable) {
      const site = env.CORS_ORIGINS[0] ?? '';
      return {
        url:
          link.product.status === 'ACTIVE' ? `${site}/produto/${link.product.slug}` : site || '/',
        tracked: false,
      };
    }
    if (meta.track === false) return { url: link.url, tracked: false };
    // Registro não bloqueia o redirecionamento: perder um clique é melhor que atrasar o visitante.
    clickRepository
      .record({
        affiliateLinkId: link.id,
        productId: link.productId,
        storeId: link.storeId,
        referrerHost: referrerHost(meta.referer),
        utmSource: cleanUtm(meta.utmSource),
      })
      .catch((err: unknown) =>
        console.error('[click] falha ao registrar', err instanceof Error ? err.message : err),
      );
    return { url: link.url, tracked: true };
  },

  async dashboard() {
    const [stats, top, stores] = await Promise.all([
      clickRepository.dashboard(),
      clickRepository.topProductIds(30, 10),
      storeRepository.listAll(),
    ]);
    const products = await productRepository.findCardsByIds(top.map((t) => t.productId));
    const names = new Map(products.map((p) => [p.id, { name: p.name, slug: p.slug }]));
    const storeNames = new Map(stores.map((s) => [s.id, s.name]));
    return {
      products: {
        total: stats.products,
        active: stats.active,
        featured: stats.featured,
        trending: stats.trending,
      },
      categories: stats.categories,
      clicks: {
        total: stats.clicksTotal,
        last30d: stats.clicks30d,
        byStore30d: stats.byStore.map((s) => ({
          store: storeNames.get(s.storeId) ?? `#${s.storeId}`,
          clicks: (s._count as { _all: number })._all,
        })),
      },
      topProducts30d: top.map((t) => ({
        productId: t.productId,
        clicks: t.clicks,
        ...names.get(t.productId),
      })),
    };
  },
};
