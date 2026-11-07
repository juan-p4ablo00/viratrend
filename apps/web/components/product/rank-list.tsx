import Link from 'next/link';
import type { PublicProductCard } from '@viratrend/shared';
import { StoreChip } from '@/components/ui/badge';
import { OfferPrice } from './price';
import { ProductImage } from './product-image';

/**
 * Ranking "Em alta": números gigantes em Bricolage (brandbook §12, página Em alta).
 * A posição é ordem editorial/atualização — não é nota nem avaliação.
 */
export function RankList({
  products,
  start = 1,
  headingLevel = 3,
}: {
  products: PublicProductCard[];
  start?: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ol className="divide-y divide-linha border-y border-linha">
      {products.map((p, i) => (
        <li
          key={p.slug}
          className="group relative grid grid-cols-[3.5rem_4.5rem_1fr] items-center gap-3 py-4 sm:grid-cols-[6rem_6rem_1fr_auto] sm:gap-6"
        >
          <span className="display text-5xl text-electric sm:text-7xl" aria-hidden>
            {String(start + i).padStart(2, '0')}
          </span>
          <div className="quina relative aspect-square overflow-hidden rounded-m rounded-tr-none bg-white [--q:14px]">
            <ProductImage image={p.image} categorySlug={p.category.slug} sizes="96px" />
          </div>
          <div className="min-w-0">
            <p className="label text-nevoa">{p.category.name}</p>
            <Heading className="mt-1 line-clamp-2 font-semibold group-hover:text-electric-deep">
              <Link href={`/produto/${p.slug}`} className="after:absolute after:inset-0">
                <span className="sr-only">{start + i}º — </span>
                {p.name}
              </Link>
            </Heading>
            {p.primaryOffer && (
              <div className="mt-2 sm:hidden">
                <StoreChip name={p.primaryOffer.store.name} />
              </div>
            )}
          </div>
          {p.primaryOffer && (
            <div className="hidden text-right sm:block">
              <OfferPrice offer={p.primaryOffer} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
