import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Container, ProductGrid } from '@/components/layout/section';
import { Gallery } from '@/components/product/gallery';
import { OfferList } from '@/components/product/offer-list';
import { ProductCard } from '@/components/product/product-card';
import { Badge } from '@/components/ui/badge';
import { AffiliateNotice } from '@/components/ui/affiliate-notice';
import { getProduct } from '@/lib/api';
import { shortDateTime } from '@/lib/format';
import { siteConfig } from '@/lib/site';
import { productJsonLd, serializeJsonLd } from '@/lib/structured-data';

// generateMetadata e a página pedem o mesmo produto: uma ida à API por requisição.
const load = cache(getProduct);

export async function generateMetadata({
  params,
}: PageProps<'/produto/[slug]'>): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return {};
  const description = product.summary ?? product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image.url, alt: product.image.alt }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<'/produto/[slug]'>) {
  const product = await load((await params).slug);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd(product, siteConfig.url)),
        }}
      />
      <Container className="py-6 md:py-10">
        <nav aria-label="Trilha" className="label mb-6 text-nevoa">
          <Link href="/" className="hover:text-midnight">
            Início
          </Link>{' '}
          /{' '}
          <Link href={`/categoria/${product.category.slug}`} className="hover:text-midnight">
            {product.category.name}
          </Link>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <Gallery
            images={product.images}
            name={product.name}
            categorySlug={product.category.slug}
          />

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {product.isTrending && <Badge tone="alta">Em alta</Badge>}
              <Badge tone="line">{product.category.name}</Badge>
            </div>
            <h1 className="display text-4xl md:text-6xl">{product.name}</h1>
            {product.summary && <p className="mt-4 text-lg text-nevoa">{product.summary}</p>}

            <div className="mt-8">
              <OfferList offers={product.offers} productName={product.name} />
              <AffiliateNotice className="mt-4" />
            </div>

            {product.curatorNote && (
              <section className="mt-8 rounded-l bg-lime p-6">
                <h2 className="label">Por que vale</h2>
                <p className="mt-3 text-lg leading-relaxed whitespace-pre-line">
                  {product.curatorNote}
                </p>
              </section>
            )}
          </div>
        </div>

        <section className="mt-12 grid gap-6 border-t border-linha pt-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="display text-3xl">Sobre o produto</h2>
            <p className="label mt-3 text-nevoa">
              Atualizado em {shortDateTime(product.updatedAt)}
            </p>
          </div>
          <div className="max-w-prose text-[17px] leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </section>
      </Container>

      {product.related.length > 0 && (
        <section className="border-t border-linha py-12">
          <Container>
            <h2 className="display mb-6 text-3xl md:text-4xl">Mais em {product.category.name}</h2>
            <ProductGrid>
              {product.related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ProductGrid>
          </Container>
        </section>
      )}
    </>
  );
}
