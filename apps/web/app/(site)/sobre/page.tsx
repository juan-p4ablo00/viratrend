import type { Metadata } from 'next';
import Link from 'next/link';
import { ProsePage } from '@/components/layout/prose-page';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'O que é a ViraTrend, como a curadoria funciona e como o site se mantém.',
  alternates: { canonical: '/sobre' },
};

export default function AboutPage() {
  return (
    <ProsePage
      eyebrow="Sobre a ViraTrend"
      title={
        <>
          Curadoria, <span className="mark">não</span> vitrine.
        </>
      }
    >
      <p>
        Todo produto viral tem um instante em que deixa de ser desconhecido e passa a ser desejado.
        A ViraTrend vive nesse instante — e mostra só o que merece virar.
      </p>
      <p>
        Não somos loja nem marketplace. Não vendemos nada, não temos checkout e não pedimos seus
        dados de pagamento. Encontramos produtos que estão em alta, olhamos com calma e indicamos
        onde comprar, com o preço e a data em que conferimos.
      </p>
      <h2>Como escolhemos</h2>
      <ul>
        <li>O produto precisa resolver algo de verdade — não basta estar em todo vídeo.</li>
        <li>Explicamos em poucas linhas por que vale (ou para quem não vale).</li>
        <li>Preço sempre com loja e data. Preço anterior só aparece quando temos o registro.</li>
        <li>Nada de contagem regressiva, “últimas unidades” ou desconto que não conferimos.</li>
      </ul>
      <h2>Como o site se mantém</h2>
      <p>
        Os botões das lojas são links de afiliado: quando você compra por eles, a loja pode nos
        pagar uma comissão, sem mudar o preço para você.{' '}
        <Link href="/como-funcionam-os-links">Veja como funciona</Link>.
      </p>
    </ProsePage>
  );
}
