import Link from 'next/link';
import { Info } from 'lucide-react';

/** Aviso de transparência exibido junto de todo botão de loja. */
export function AffiliateNotice({ className = '' }: { className?: string }) {
  return (
    <p className={`flex gap-2 text-[13px] leading-snug text-nevoa ${className}`}>
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        Os botões levam à loja por um link de afiliado: você compra direto na loja e a ViraTrend
        pode receber uma comissão, sem custo extra.{' '}
        <Link
          href="/como-funcionam-os-links"
          className="underline underline-offset-2 hover:text-electric-deep"
        >
          Como funciona
        </Link>
      </span>
    </p>
  );
}
