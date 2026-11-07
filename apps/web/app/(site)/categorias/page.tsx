import type { Metadata } from 'next';
import { Container } from '@/components/layout/section';
import { EmptyState, PageHero } from '@/components/layout/page-hero';
import { CategoryTile } from '@/components/product/category-tile';
import { listCategories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Categorias',
  description:
    'Tecnologia, casa, beleza, moda, utilidades, games e fitness: achados organizados por assunto.',
  alternates: { canonical: '/categorias' },
};

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <>
      <PageHero eyebrow="Categorias" title="Explore por assunto">
        Cada categoria tem a sua cor — e só produtos que passaram pela curadoria.
      </PageHero>
      <Container className="pb-16">
        {categories.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryTile key={c.slug} category={c} tall />
            ))}
          </div>
        ) : (
          <EmptyState title="Categorias indisponíveis">Tente novamente em instantes.</EmptyState>
        )}
      </Container>
    </>
  );
}
