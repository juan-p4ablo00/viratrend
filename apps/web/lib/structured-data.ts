/**
 * Dados estruturados (schema.org) da página de produto.
 *
 * Regra do projeto: nada de preço ou disponibilidade sem dado confiável. Por isso:
 * - `offers` só entra se o preço foi conferido nas últimas PRICE_FRESH_HOURS horas;
 * - `availability` nunca é informado (não sabemos o estoque da loja);
 * - sem avaliações nem notas (não as coletamos).
 * Sem import de alias "@/": roda direto no `node --test`.
 */
import type { PublicProductDetail } from '@viratrend/shared';

export const PRICE_FRESH_HOURS = 24;

export function productJsonLd(p: PublicProductDetail, siteUrl: string, now = Date.now()) {
  const url = new URL(`/produto/${p.slug}`, siteUrl).toString();
  const fresh = p.offers.filter(
    (o) =>
      o.priceCents !== null &&
      o.priceCheckedAt !== null &&
      now - new Date(o.priceCheckedAt).getTime() <= PRICE_FRESH_HOURS * 3_600_000,
  );

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.summary ?? p.description.slice(0, 300),
    url,
    category: p.category.name,
    ...(p.images.length && { image: p.images.map((i) => i.url) }),
  };
  if (fresh.length) {
    product.offers = fresh.map((o) => ({
      '@type': 'Offer',
      price: (o.priceCents! / 100).toFixed(2),
      priceCurrency: 'BRL',
      seller: { '@type': 'Organization', name: o.store.name },
      url, // a página do produto; o link de afiliado não é exposto
    }));
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: new URL('/', siteUrl).toString() },
      {
        '@type': 'ListItem',
        position: 2,
        name: p.category.name,
        item: new URL(`/categoria/${p.category.slug}`, siteUrl).toString(),
      },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ],
  };
  return [product, breadcrumb];
}

/** Serializa para <script type="application/ld+json"> sem permitir fechar a tag (XSS). */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
