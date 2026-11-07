import type { PublicOffer } from '@viratrend/shared';
import { Badge } from '@/components/ui/badge';
import { affiliateLinkProps, buttonClass } from '@/components/ui/button';
import { shortDateTime } from '@/lib/format';
import { OfferPrice } from './price';

/**
 * Ofertas por loja na página do produto. A principal vem primeiro e ganha o botão grande;
 * as alternativas aparecem em linhas menores. Cada linha diz quando o preço foi conferido.
 */
export function OfferList({ offers, productName }: { offers: PublicOffer[]; productName: string }) {
  if (!offers.length) {
    return <p className="rounded-m bg-white p-5 text-nevoa">Nenhuma loja disponível no momento.</p>;
  }
  const [main, ...others] = offers;
  return (
    <div className="space-y-3">
      {main && (
        <div className="quina relative rounded-l bg-white p-5 [--q:24px]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="label">{main.store.name}</span>
            {main.previousPriceCents ? (
              <Badge tone="queda">Caiu o preço</Badge>
            ) : main.offerVerifiedAt ? (
              <Badge tone="dark">Oferta conferida {shortDateTime(main.offerVerifiedAt)}</Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            {main.priceCents !== null ? (
              <OfferPrice offer={main} size="lg" />
            ) : (
              <p className="text-nevoa">Confira o preço atualizado na loja.</p>
            )}
            <a
              href={main.goUrl}
              {...affiliateLinkProps}
              className={`${buttonClass.primary} w-full sm:w-auto`}
              aria-label={`Ver ${productName} na ${main.store.name} (link de afiliado, abre em nova aba)`}
            >
              Ver na {main.store.name} ↗
            </a>
          </div>
        </div>
      )}
      {others.length > 0 && (
        <ul className="divide-y divide-linha rounded-l border border-linha bg-white">
          <li className="label px-5 pt-4 pb-2 text-nevoa">Também em</li>
          {others.map((o) => (
            <li key={o.goUrl} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold">{o.store.name}</p>
                {o.priceCents !== null && <OfferPrice offer={o} />}
              </div>
              <a
                href={o.goUrl}
                {...affiliateLinkProps}
                className={buttonClass.storeSm}
                aria-label={`Ver ${productName} na ${o.store.name} (link de afiliado, abre em nova aba)`}
              >
                Ver ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
