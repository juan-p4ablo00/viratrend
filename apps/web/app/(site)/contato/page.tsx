import type { Metadata } from 'next';
import { ProsePage } from '@/components/layout/prose-page';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a ViraTrend: sugestões de produtos, correções de preço e parcerias.',
  alternates: { canonical: '/contato' },
};

// Sem formulário de propósito: não coletamos dados pessoais sem um canal configurado para respondê-los.
export default function ContactPage() {
  return (
    <ProsePage eyebrow="Contato" title="Fale com a gente">
      <p>
        Viu um preço desatualizado, um link quebrado ou um achado que merece aparecer aqui? Conta
        pra gente.
      </p>
      {siteConfig.contactEmail ? (
        <p>
          E-mail: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      ) : (
        <p>O canal de contato está sendo configurado e aparece aqui em breve.</p>
      )}
      {siteConfig.social.length > 0 && (
        <p>
          Também respondemos em{' '}
          {siteConfig.social.map((s, i) => (
            <span key={s.label}>
              {i > 0 && ' e '}
              <a href={s.url} target="_blank" rel="noopener">
                {s.label}
              </a>
            </span>
          ))}
          .
        </p>
      )}
      <p>
        Dúvidas sobre um pedido, entrega ou troca devem ir direto à loja onde a compra foi feita — a
        ViraTrend não vende nem tem acesso aos pedidos.
      </p>
    </ProsePage>
  );
}
