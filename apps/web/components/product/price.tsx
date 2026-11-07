import type { PublicOffer } from '@viratrend/shared';
import { formatBRL, timeAgo } from '@/lib/format';

/** "R$ 89,90" no padrão do brandbook: R$ pequeno, reais grandes, centavos sobrescritos. */
export function Price({ cents, className = '' }: { cents: number; className?: string }) {
  const [reais, centavos] = formatBRL(cents)
    .replace(/^R\$\s?/, '')
    .split(',');
  return (
    <span
      className={`tabular leading-none font-bold tracking-[-0.04em] whitespace-nowrap ${className}`}
    >
      <small className="mr-[0.15em] align-[0.95em] text-[0.42em] font-medium tracking-normal">
        R$
      </small>
      {reais}
      <sup className="text-[0.45em]">,{centavos}</sup>
    </span>
  );
}

/**
 * Bloco de preço de uma oferta. Preço anterior só aparece quando a API o comprova
 * (histórico real); sem preço conferido, nada é exibido — nunca um valor inventado.
 */
export function OfferPrice({ offer, size = 'md' }: { offer: PublicOffer; size?: 'md' | 'lg' }) {
  if (offer.priceCents === null) return null;
  return (
    <div>
      {offer.previousPriceCents && (
        <span className="tabular block text-xs text-nevoa line-through decoration-brasa decoration-2">
          <span className="sr-only">Preço anterior registrado: </span>
          {formatBRL(offer.previousPriceCents)}
        </span>
      )}
      <Price cents={offer.priceCents} className={size === 'lg' ? 'text-5xl' : 'text-[26px]'} />
      {offer.priceCheckedAt && (
        <span className="label mt-1 block text-[10px] font-medium text-nevoa">
          conferido {timeAgo(offer.priceCheckedAt)}
        </span>
      )}
    </div>
  );
}
