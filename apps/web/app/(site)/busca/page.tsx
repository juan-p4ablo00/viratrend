import type { Metadata } from 'next';
import { Container, ProductGrid } from '@/components/layout/section';
import { EmptyState } from '@/components/layout/page-hero';
import { CategoryTile } from '@/components/product/category-tile';
import { ProductCard } from '@/components/product/product-card';
import { Pagination, parsePage } from '@/components/ui/pagination';
import { SearchForm } from '@/components/ui/search-form';
import { listCategories, listProducts } from '@/lib/api';

// Resultado de busca não deve ser indexado (conteúdo duplicado e infinito).
export const metadata: Metadata = { title: 'Busca', robots: { index: false, follow: true } };

const LIMIT = 24;

export default async function SearchPage({ searchParams }: PageProps<'/busca'>) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? '').trim().slice(0, 80);
  const page = parsePage(sp.page);
  const valid = q.length >= 2;

  const [results, categories, trending] = await Promise.all([
    valid ? listProducts({ q, page, limit: LIMIT }) : null,
    listCategories(),
    valid ? null : listProducts({ section: 'trending', limit: 4 }),
  ]);

  return (
    <Container className="py-10 md:py-14">
      <h1 className="display mb-6 text-5xl md:text-6xl">
        {valid ? (
          <>
            Resultados para <span className="mark">{q}</span>
          </>
        ) : (
          'Buscar achados'
        )}
      </h1>
      <div className="mb-10 max-w-2xl">
        <SearchForm defaultValue={q} autoFocus={!valid} />
      </div>

      {results && results.items.length > 0 && (
        <>
          <p className="label mb-5 text-nevoa" role="status">
            {results.total} {results.total === 1 ? 'resultado' : 'resultados'}
          </p>
          <ProductGrid>
            {results.items.map((p) => (
              <ProductCard key={p.slug} product={p} headingLevel={2} />
            ))}
          </ProductGrid>
          <Pagination
            page={page}
            total={results.total}
            limit={LIMIT}
            basePath="/busca"
            params={{ q }}
          />
        </>
      )}

      {results && results.items.length === 0 && (
        <EmptyState title="Nada encontrado">
          Tente outra palavra ou navegue pelas categorias abaixo.
        </EmptyState>
      )}

      {trending && trending.items.length > 0 && (
        <section className="mb-12">
          <h2 className="label mb-4 text-electric-deep">Em alta agora</h2>
          <ProductGrid>
            {trending.items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      {(!results || results.items.length === 0) && categories.length > 0 && (
        <section className="mt-12">
          <h2 className="label mb-4 text-electric-deep">Categorias</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <CategoryTile key={c.slug} category={c} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
