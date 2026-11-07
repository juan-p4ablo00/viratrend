import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, ProductGrid } from '@/components/layout/section';
import { EmptyState } from '@/components/layout/page-hero';
import { ProductCard } from '@/components/product/product-card';
import { Pagination, parsePage } from '@/components/ui/pagination';
import { listCategories, listProducts } from '@/lib/api';
import { categoryTheme } from '@/lib/category-theme';

const LIMIT = 24;

async function findCategory(slug: string) {
  return (await listCategories()).find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<'/categoria/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Achados de ${category.name} selecionados pela ViraTrend.`,
    alternates: { canonical: `/categoria/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<'/categoria/[slug]'>) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);
  if (!category) notFound();

  const page = parsePage(sp.page);
  const data = await listProducts({ category: slug, page, limit: LIMIT });
  const t = categoryTheme(slug);

  return (
    <>
      <header className={`${t.bg} ${t.fg} ${t.bg === 'bg-white' ? 'border-b border-linha' : ''}`}>
        <Container className="relative py-10 md:py-14">
          <nav aria-label="Trilha" className="label opacity-70">
            <Link href="/categorias" className="hover:underline">
              Categorias
            </Link>{' '}
            / {category.name}
          </nav>
          <h1 className="display mt-3 text-5xl md:text-7xl">{category.name}</h1>
          {category.description && (
            <p className="mt-3 max-w-xl text-lg opacity-80">{category.description}</p>
          )}
          <p className="label mt-5 opacity-70">
            {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
          </p>
          <i
            aria-hidden
            className={`absolute top-8 right-4 size-16 md:right-8 md:size-24 ${t.spark} [clip-path:polygon(0_0,100%_0,100%_100%)]`}
          />
        </Container>
      </header>
      <Container className="py-10 md:py-14">
        {data.items.length ? (
          <>
            <ProductGrid>
              {data.items.map((p, i) => (
                <ProductCard key={p.slug} product={p} priority={i < 2} headingLevel={2} />
              ))}
            </ProductGrid>
            <Pagination
              page={page}
              total={data.total}
              limit={LIMIT}
              basePath={`/categoria/${slug}`}
            />
          </>
        ) : (
          <EmptyState title="Ainda sem achados aqui">
            Estamos garimpando. Veja o que está{' '}
            <Link href="/em-alta" className="underline">
              em alta
            </Link>{' '}
            enquanto isso.
          </EmptyState>
        )}
      </Container>
    </>
  );
}
