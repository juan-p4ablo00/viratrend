import type { Metadata } from 'next';
import Link from 'next/link';
import { ProsePage } from '@/components/layout/prose-page';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Condições de uso da ViraTrend, plataforma de curadoria de produtos.',
  alternates: { canonical: '/termos' },
};

// Versão inicial — revisar com assessoria jurídica antes do lançamento.
export default function TermsPage() {
  return (
    <ProsePage eyebrow="Termos" title="Termos de Uso" updated="06/11/2026">
      <p>Ao usar a ViraTrend você concorda com estes termos. Se não concordar, não use o site.</p>
      <h2>O que a ViraTrend é</h2>
      <p>
        Uma plataforma de descoberta e curadoria de produtos. Não somos loja: não vendemos, não
        entregamos e não processamos pagamentos. Toda compra é feita no site da loja indicada, sob
        as condições dela.
      </p>
      <h2>Preços, ofertas e disponibilidade</h2>
      <p>
        Mostramos preços com a data em que foram conferidos. Eles podem mudar na loja a qualquer
        momento; o preço válido é sempre o exibido pela loja no momento da compra.
      </p>
      <h2>Links de afiliado</h2>
      <p>
        Alguns links geram comissão para a ViraTrend.{' '}
        <Link href="/como-funcionam-os-links">Entenda como funciona</Link>.
      </p>
      <h2>Conteúdo</h2>
      <p>
        Textos e identidade visual da ViraTrend são protegidos. Marcas, nomes e imagens de produtos
        pertencem aos respectivos titulares e são usados apenas para identificar os produtos.
      </p>
      <h2>Responsabilidade</h2>
      <p>
        Indicamos produtos de boa-fé, mas não garantimos resultado, qualidade, entrega ou
        atendimento das lojas. Problemas com pedidos devem ser tratados com a loja.
      </p>
      <h2>Mudanças</h2>
      <p>Podemos atualizar estes termos; a data no topo indica a versão vigente.</p>
    </ProsePage>
  );
}
