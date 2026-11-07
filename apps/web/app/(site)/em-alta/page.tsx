import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/section';
import { EmptyState, PageHero } from '@/components/layout/page-hero';
import { RankList } from '@/components/product/rank-list';
import { Pagination, parsePage } from '@/components/ui/pagination';
import { listProducts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Em alta',
  description: 'Os produtos que estão virando agora, escolhidos pela curadoria da ViraTrend.',
  alternates: { canonical: '/em-alta' },
};

const LIMIT = 20;

export default async function TrendingPage({ searchParams }: PageProps<'/em-alta'>) {
  const page = parsePage((await searchParams).page);
  const data = await listProducts({ section: 'trending', page, limit: LIMIT });

  return (
    <>
      <PageHero
        eyebrow="Em alta"
        title={
          <>
            O que está <span className="mark">virando</span>
          </>
        }
      >
        Produtos com destaque editorial agora — o que apareceu em todo lugar e passou pelo nosso
        filtro. A posição é ordem de atualização, não nota.
      </PageHero>
      <Container className="pb-16">
        {data.items.length ? (
          <>
            <RankList products={data.items} start={(page - 1) * LIMIT + 1} headingLevel={2} />
            <Pagination page={page} total={data.total} limit={LIMIT} basePath="/em-alta" />
          </>
        ) : (
          <EmptyState title="Nada em alta agora">
            A curadoria está atualizando a lista. Enquanto isso, veja os{' '}
            <Link href="/categorias" className="underline">
              achados por categoria
            </Link>
            .
          </EmptyState>
        )}
      </Container>
    </>
  );
}
