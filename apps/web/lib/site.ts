/** Configuração pública do site. Nada sensível aqui: este arquivo vai para o navegador. */
export const siteConfig = {
  name: 'ViraTrend',
  tagline: 'Produtos que viralizam. Achados que valem a pena.',
  description:
    'Curadoria de produtos virais, achadinhos e ofertas conferidas. Preço com data e loja de origem em todo produto.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  affiliateDisclosure:
    'A ViraTrend participa de programas de afiliados (Amazon e Mercado Livre) e pode receber comissão por compras feitas pelos links, sem custo extra para você. Preços e disponibilidade podem mudar na loja.',
} as const;

export const mainNav = [
  { href: '/em-alta', label: 'Em alta' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/ofertas', label: 'Ofertas' },
  { href: '/sobre', label: 'Sobre' },
] as const;
