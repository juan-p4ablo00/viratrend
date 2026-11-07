import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PublicOffer, PublicProductDetail } from '@viratrend/shared';
import { productJsonLd, serializeJsonLd } from './structured-data.ts';

const NOW = Date.parse('2026-11-06T12:00:00Z');
const offer = (checkedHoursAgo: number | null, priceCents: number | null = 8990): PublicOffer => ({
  store: { slug: 'amazon', name: 'Amazon' },
  goUrl: 'https://api.example/go/1',
  isPrimary: true,
  priceCents,
  previousPriceCents: null,
  priceCheckedAt:
    checkedHoursAgo === null ? null : new Date(NOW - checkedHoursAgo * 3_600_000).toISOString(),
  offerVerifiedAt: null,
});
const product = (offers: PublicOffer[]): PublicProductDetail => ({
  slug: 'fone',
  name: 'Fone </script><script>alert(1)</script>',
  summary: 'Resumo',
  description: 'Descrição',
  curatorNote: null,
  category: { slug: 'tecnologia', name: 'Tecnologia' },
  image: null,
  images: [],
  primaryOffer: offers[0] ?? null,
  offers,
  related: [],
  isTrending: false,
  isFeatured: false,
  publishedAt: null,
  updatedAt: new Date(NOW).toISOString(),
});

test('preço conferido há menos de 24h entra como Offer, sem availability', () => {
  const [p] = productJsonLd(product([offer(2)]), 'https://viratrend.com.br', NOW);
  const offers = (p as { offers: Record<string, unknown>[] }).offers;
  assert.equal(offers[0]!.price, '89.90');
  assert.equal(offers[0]!.priceCurrency, 'BRL');
  assert.equal('availability' in offers[0]!, false);
  assert.equal(JSON.stringify(p).includes('api.example/go'), false, 'link de afiliado não vaza');
});

test('preço velho, ausente ou sem data não gera Offer', () => {
  for (const o of [offer(30), offer(null), offer(1, null)]) {
    const [p] = productJsonLd(product([o]), 'https://viratrend.com.br', NOW);
    assert.equal('offers' in p!, false);
  }
});

test('serialização não permite fechar a tag script', () => {
  const out = serializeJsonLd(productJsonLd(product([]), 'https://viratrend.com.br', NOW));
  assert.equal(out.includes('</script>'), false);
});
