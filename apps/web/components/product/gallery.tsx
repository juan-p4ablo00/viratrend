import type { PublicImage } from '@viratrend/shared';
import { ProductImage } from './product-image';

/**
 * Galeria sem JavaScript: scroll-snap horizontal com âncoras nas miniaturas.
 * Primeira imagem com prioridade (LCP).
 */
export function Gallery({
  images,
  name,
  categorySlug,
}: {
  images: PublicImage[];
  name: string;
  categorySlug: string;
}) {
  const list: (PublicImage | null)[] = images.length ? images : [null];
  return (
    <div>
      <div className="relative">
        <div
          className="quina flex snap-x snap-mandatory overflow-x-auto rounded-l rounded-tr-none bg-white [--q:36px] [scrollbar-width:none]"
          aria-label={`Fotos de ${name}`}
        >
          {list.map((img, i) => (
            <div
              key={i}
              id={`foto-${i + 1}`}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <ProductImage
                image={img}
                categorySlug={categorySlug}
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <i aria-hidden className="spark bg-electric [--g:10px] [--q:36px]" />
      </div>
      {images.length > 1 && (
        <nav aria-label="Escolher foto" className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <a
              key={i}
              href={`#foto-${i + 1}`}
              className="relative size-16 shrink-0 overflow-hidden rounded-s border border-linha bg-white hover:border-midnight"
            >
              <ProductImage image={img} categorySlug={categorySlug} sizes="64px" />
              <span className="sr-only">Foto {i + 1}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
