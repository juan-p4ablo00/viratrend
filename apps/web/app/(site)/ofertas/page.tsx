import type { Metadata } from 'next';
import { OFFER_MAX_AGE_DAYS } from '@viratrend/shared';
import { Container, ProductGrid } from '@/components/layout/section';
import { EmptyState, PageHero } from '@/components/layout/page-hero';
import { ProductCard } from '@/components/product/product-card';
import { AffiliateNotice } from '@/components/ui/affiliate-notice';
import { Pagination, parsePage } from '@/components/ui/pagination';
import { listProducts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Ofertas conferidas',
  description: `Ofertas conferidas pela ViraTrend nos últimos ${OFFER_MAX_AGE_DAYS} dias, com preço, loja e data da verificação.`,
  alternates: { canonical: '/ofertas' },
};

const LIMIT = 24;

export default async function OffersPage({ searchParams }: PageProps<'/ofertas'>) {
  const page = parsePage((await searchParams).page);
  const data = await listProducts({ section: 'offers', page, limit: LIMIT });

  return (
    <>
      <PageHero
        eyebrow="Ofertas"
        title="Preço conferido, sem pressa falsa"
        className="bg-midnight text-off"
      >
        Cada oferta aqui foi conferida na loja nos últimos {OFFER_MAX_AGE_DAYS} dias. Mostramos o
        preço anterior só quando temos o registro — e nunca usamos contagem regressiva.
      </PageHero>
      <Container className="py-10 md:py-14">
        <AffiliateNotice className="mb-8" />
        {data.items.length ? (
          <>
            <ProductGrid>
              {data.items.map((p) => (
                <ProductCard key={p.slug} product={p} headingLevel={2} />
              ))}
            </ProductGrid>
            <Pagination page={page} total={data.total} limit={LIMIT} basePath="/ofertas" />
          </>
        ) : (
          <EmptyState title="Nenhuma oferta conferida agora">
            Preferimos uma página vazia a uma promoção que não confirmamos. Volte em breve.
          </EmptyState>
        )}
      </Container>
    </>
  );
}
