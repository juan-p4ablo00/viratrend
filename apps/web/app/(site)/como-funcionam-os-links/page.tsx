import type { Metadata } from 'next';
import { OFFER_MAX_AGE_DAYS } from '@viratrend/shared';
import { ProsePage } from '@/components/layout/prose-page';

export const metadata: Metadata = {
  title: 'Como funcionam os links',
  description:
    'Transparência sobre os links de afiliado da ViraTrend: o que são, quem paga e o que muda para você.',
  alternates: { canonical: '/como-funcionam-os-links' },
};

export default function AffiliateLinksPage() {
  return (
    <ProsePage eyebrow="Transparência" title="Como funcionam os links" updated="06/11/2026">
      <p>
        A ViraTrend participa dos programas de afiliados da <strong>Amazon</strong> e do{' '}
        <strong>Mercado Livre</strong>. Quando você clica em “Ver na loja” e compra, a loja pode
        pagar uma comissão à ViraTrend.
      </p>
      <h2>O que muda para você</h2>
      <ul>
        <li>Nada no preço: a comissão sai da loja, não do seu bolso.</li>
        <li>
          A compra, o pagamento, a entrega, a troca e a garantia acontecem inteiramente na loja.
        </li>
        <li>Nunca pedimos dados de cartão, endereço ou senha.</li>
      </ul>
      <h2>O que acontece no clique</h2>
      <p>
        O botão passa rapidamente por um endereço da própria ViraTrend, que conta o clique e envia
        você à loja. Registramos apenas qual produto e qual loja foram clicados, o site de onde você
        veio (por exemplo, “tiktok.com”) e a campanha, quando existe. Não guardamos seu IP nem
        criamos perfil seu.
      </p>
      <h2>Preços e ofertas</h2>
      <ul>
        <li>
          Todo preço mostra quando foi conferido. Lojas mudam preços a qualquer momento: vale o da
          loja.
        </li>
        <li>“Oferta conferida” só aparece por {OFFER_MAX_AGE_DAYS} dias depois da verificação.</li>
        <li>
          Preço anterior riscado só aparece quando temos esse preço registrado no nosso histórico.
        </li>
      </ul>
      <h2>A comissão influencia a escolha?</h2>
      <p>
        Indicamos produtos que achamos que valem a pena, em lojas onde temos programa de afiliado.
        Se um produto não vale, ele não entra — mesmo com comissão.
      </p>
    </ProsePage>
  );
}
