import Link from 'next/link';
import type { PublicProductCard } from '@viratrend/shared';
import { Badge, StoreChip } from '@/components/ui/badge';
import { affiliateLinkProps, buttonClass } from '@/components/ui/button';
import { OfferPrice } from './price';
import { ProductImage } from './product-image';

/**
 * Card de produto (brandbook §11): foto com Quina, salto colorido pelo estado, loja visível
 * antes do clique, preço mono com "conferido há…".
 * O card inteiro leva à página do produto; o botão da loja (afiliado) fica acima do link.
 */
export function ProductCard({
  product,
  size = 'md',
  priority = false,
  headingLevel = 3,
}: {
  product: PublicProductCard;
  size?: 'md' | 'lg';
  priority?: boolean;
  /** 2 quando o card fica direto sob o h1 da página (listagens); 3 dentro de seções com h2. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const offer = product.primaryOffer;
  const dropped = !!offer?.previousPriceCents;
  const sparkColor = dropped ? 'bg-brasa' : offer?.offerVerifiedAt ? 'bg-lime' : 'bg-electric';
  const lg = size === 'lg';

  return (
    <article className="lift group relative flex h-full flex-col rounded-l border border-linha bg-white p-3">
      <div className="quina relative aspect-square overflow-hidden rounded-m rounded-tr-none">
        <ProductImage
          image={product.image}
          categorySlug={product.category.slug}
          sizes={lg ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
          priority={priority}
        />
      </div>
      <i aria-hidden className={`spark ${sparkColor}`} style={{ top: 5, right: 5 }} />

      <div className="mx-1 mt-3 mb-1.5 flex flex-wrap items-center gap-1.5">
        {dropped && <Badge tone="queda">Caiu o preço</Badge>}
        {!dropped && offer?.offerVerifiedAt && <Badge tone="dark">Oferta conferida</Badge>}
        {product.isTrending && <Badge tone="alta">Em alta</Badge>}
        {offer && <StoreChip name={offer.store.name} />}
      </div>

      <Heading
        className={`mx-1 mb-3 font-semibold ${lg ? 'display text-3xl' : 'line-clamp-2 text-[15px] leading-snug'}`}
      >
        {/* Link "esticado": cobre o card todo, exceto o botão da loja (z-10). */}
        <Link
          href={`/produto/${product.slug}`}
          className="after:absolute after:inset-0 after:rounded-l"
        >
          {product.name}
        </Link>
      </Heading>
      {lg && product.summary && <p className="mx-1 mb-4 text-nevoa">{product.summary}</p>}

      <div className="mx-1 mt-auto flex items-end justify-between gap-2">
        {offer ? (
          <OfferPrice offer={offer} />
        ) : (
          <span className="label text-nevoa">Preço na loja</span>
        )}
        {offer && (
          <a
            href={offer.goUrl}
            {...affiliateLinkProps}
            className={`${buttonClass.storeSm} relative z-10`}
            aria-label={`Ver ${product.name} na ${offer.store.name} (link de afiliado, abre em nova aba)`}
          >
            Ver ↗
          </a>
        )}
      </div>
    </article>
  );
}
