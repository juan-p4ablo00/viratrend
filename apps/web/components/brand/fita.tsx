import { Tri } from '@/components/ui/badge';

/**
 * Fita (brandbook §07): faixa mono em movimento com o salto como separador.
 * Decorativa para leitores de tela quando os itens repetem conteúdo já presente na página.
 */
export function Fita({
  items,
  tone = 'lime',
  className = '',
}: {
  items: string[];
  tone?: 'lime' | 'electric';
  className?: string;
}) {
  if (!items.length) return null;
  // Repete até encher a largura e duplica para o loop de -50% não ter emenda.
  const row = Array.from({ length: Math.ceil(8 / items.length) }, () => items).flat();
  const colors = tone === 'lime' ? 'bg-lime text-midnight' : 'bg-electric text-white';
  return (
    <div aria-hidden className={`overflow-hidden py-2.5 whitespace-nowrap ${colors} ${className}`}>
      <div className="animate-fita inline-flex">
        {[...row, ...row].map((text, i) => (
          <span key={i} className="label mx-5 inline-flex items-center gap-2 text-[11px] font-bold">
            {text} <Tri />
          </span>
        ))}
      </div>
    </div>
  );
}
