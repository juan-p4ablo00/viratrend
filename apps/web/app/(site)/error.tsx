'use client';

import { Container } from '@/components/layout/section';
import { buttonClass } from '@/components/ui/button';

/** Falha inesperada (ex.: API fora do ar no detalhe do produto). Sem detalhes técnicos na tela. */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-16 md:py-24">
      <p className="label text-electric-deep">Algo deu errado</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Não conseguimos carregar esta página.</h1>
      <p className="mt-4 max-w-lg text-lg text-nevoa">
        Pode ser instabilidade momentânea. Tente de novo.
      </p>
      <button type="button" onClick={reset} className={`${buttonClass.primary} mt-8`}>
        Tentar novamente
      </button>
    </Container>
  );
}
