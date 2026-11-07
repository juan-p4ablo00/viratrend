import type { Metadata } from 'next';
import { ProsePage } from '@/components/layout/prose-page';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Quais dados a ViraTrend trata, por quê e por quanto tempo (LGPD).',
  alternates: { canonical: '/privacidade' },
};

// Versão inicial escrita a partir do que o sistema realmente faz — revisar com assessoria
// jurídica antes do lançamento e sempre que o tratamento de dados mudar.
export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Privacidade" title="Política de Privacidade" updated="06/11/2026">
      <p>
        A ViraTrend foi feita para coletar o mínimo possível. Não há cadastro de visitantes, não
        vendemos produtos e não recebemos dados de pagamento. Esta política segue a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018).
      </p>
      <h2>O que tratamos</h2>
      <ul>
        <li>
          <strong>Cliques nos botões das lojas:</strong> produto, loja, data, site de origem (só o
          domínio, como “tiktok.com”) e campanha (utm_source). Não guardamos IP nem identificador
          seu. Finalidade: saber quais produtos e lojas interessam.
        </li>
        <li>
          <strong>Dados técnicos de acesso:</strong> o endereço IP é usado momentaneamente para
          limitar abusos (excesso de requisições) e pode constar em registros de segurança da
          hospedagem.
        </li>
        <li>
          <strong>Equipe da ViraTrend:</strong> quem acessa o painel tem e-mail, nome e senha
          (guardada apenas como hash) e um cookie de sessão necessário para o login.
        </li>
      </ul>
      <h2>Cookies</h2>
      <p>
        Visitantes não recebem cookies de rastreamento ou publicidade da ViraTrend. O único cookie
        da plataforma é o de sessão do painel administrativo. Ao ir para uma loja, valem as
        políticas de privacidade e de cookies da loja.
      </p>
      <h2>Compartilhamento</h2>
      <p>
        Não vendemos dados. Usamos provedores de hospedagem (Vercel e Hostinger) para operar o site.
        Ao clicar em uma loja, você sai da ViraTrend e passa a ser atendido por ela.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode pedir confirmação, acesso, correção ou exclusão de dados pessoais
        {siteConfig.contactEmail ? (
          <>
            {' '}
            pelo e-mail <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </>
        ) : (
          ' pelo canal indicado na página de contato.'
        )}
      </p>
    </ProsePage>
  );
}
