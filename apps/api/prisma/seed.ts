/**
 * Seed da ViraTrend.
 *
 *   npm run db:seed              → categorias e lojas (dados reais de configuração, idempotente)
 *   npm run db:seed -- --demo    → + produtos de DEMONSTRAÇÃO, todos com "[DEMO]" no nome,
 *                                  links para a página inicial da loja (não são de afiliado)
 *                                  e sem imagens (não temos direito de uso de fotos de terceiros).
 *
 * Nunca rode --demo no banco de produção.
 */
import { prisma } from '../src/config/db.ts';

const categories = [
  {
    slug: 'tecnologia',
    name: 'Tecnologia',
    description: 'Gadgets, acessórios e eletrônicos que viralizaram.',
  },
  { slug: 'casa', name: 'Casa', description: 'Organização, decoração e utilidades para o lar.' },
  { slug: 'beleza', name: 'Beleza', description: 'Skincare, maquiagem e cuidados pessoais.' },
  { slug: 'moda', name: 'Moda', description: 'Roupas e acessórios em alta.' },
  { slug: 'utilidades', name: 'Utilidades', description: 'Achados práticos para o dia a dia.' },
  { slug: 'games', name: 'Games', description: 'Acessórios e periféricos para jogar melhor.' },
  { slug: 'fitness', name: 'Fitness', description: 'Treino, recuperação e vida ativa.' },
];

const stores = [
  { slug: 'amazon', name: 'Amazon', websiteUrl: 'https://www.amazon.com.br' },
  { slug: 'mercado-livre', name: 'Mercado Livre', websiteUrl: 'https://www.mercadolivre.com.br' },
];

async function seedBase() {
  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i },
    });
  }
  for (const s of stores) {
    await prisma.store.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }
  console.log(`Base: ${categories.length} categorias, ${stores.length} lojas.`);
}

async function seedDemo() {
  const cat = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]));
  const st = Object.fromEntries((await prisma.store.findMany()).map((s) => [s.slug, s]));
  const demo = [
    {
      slug: 'demo-fone-bluetooth',
      name: '[DEMO] Fone bluetooth compacto',
      cat: 'tecnologia',
      store: 'amazon',
      prices: [11990, 8990],
      featured: true,
      trending: true,
      offer: true,
    },
    {
      slug: 'demo-luminaria-touch',
      name: '[DEMO] Luminária touch sem fio',
      cat: 'casa',
      store: 'mercado-livre',
      prices: [6400],
      featured: true,
      trending: false,
      offer: false,
    },
    {
      slug: 'demo-serum-niacinamida',
      name: '[DEMO] Sérum de niacinamida 30ml',
      cat: 'beleza',
      store: 'mercado-livre',
      prices: [4250],
      featured: false,
      trending: true,
      offer: false,
    },
    {
      slug: 'demo-copo-termico',
      name: '[DEMO] Copo térmico 900ml',
      cat: 'utilidades',
      store: 'amazon',
      prices: [13990, 8990],
      featured: false,
      trending: true,
      offer: true,
    },
    {
      slug: 'demo-mouse-gamer',
      name: '[DEMO] Mouse gamer leve',
      cat: 'games',
      store: 'amazon',
      prices: [15900],
      featured: false,
      trending: false,
      offer: false,
    },
    {
      slug: 'demo-faixa-elastica',
      name: '[DEMO] Kit de faixas elásticas',
      cat: 'fitness',
      store: 'mercado-livre',
      prices: [5990],
      featured: false,
      trending: false,
      offer: false,
    },
  ];
  for (const d of demo) {
    const store = st[d.store]!;
    const product = await prisma.product.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        slug: d.slug,
        name: d.name,
        summary: 'Dados de demonstração — não é um produto real.',
        description: 'Produto fictício criado para testar a interface. Não compre, não divulgue.',
        curatorNote: 'Exemplo de bloco "Por que vale" para validar o layout.',
        keywords: 'demo teste',
        categoryId: cat[d.cat]!,
        status: 'ACTIVE',
        isFeatured: d.featured,
        isTrending: d.trending,
        publishedAt: new Date(),
      },
    });
    const existing = await prisma.affiliateLink.findUnique({
      where: { productId_storeId: { productId: product.id, storeId: store.id } },
    });
    if (existing) continue;
    const current = d.prices.at(-1)!;
    const link = await prisma.affiliateLink.create({
      data: {
        productId: product.id,
        storeId: store.id,
        url: store.websiteUrl, // página inicial da loja: NÃO é link de afiliado
        isPrimary: true,
        priceCents: current,
        priceCheckedAt: new Date(),
        offerStatus: d.offer ? 'VERIFIED' : 'NONE',
        offerCheckedAt: d.offer ? new Date() : null,
      },
    });
    for (const [i, priceCents] of d.prices.entries()) {
      await prisma.priceHistory.create({
        data: {
          affiliateLinkId: link.id,
          priceCents,
          source: '[DEMO] valor fictício',
          checkedAt: new Date(Date.now() - (d.prices.length - 1 - i) * 86_400_000),
        },
      });
    }
  }
  console.log(`Demo: ${demo.length} produtos [DEMO].`);
}

await seedBase();
if (process.argv.includes('--demo')) await seedDemo();
await prisma.$disconnect();
