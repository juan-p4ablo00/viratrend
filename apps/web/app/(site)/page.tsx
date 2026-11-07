import Link from 'next/link';
import { Fita } from '@/components/brand/fita';
import { Selo } from '@/components/brand/selo';
import { Container, ProductRail, RailItem, SectionHeader } from '@/components/layout/section';
import { CategoryTile } from '@/components/product/category-tile';
import { ProductCard } from '@/components/product/product-card';
import { RankList } from '@/components/product/rank-list';
import { Tri } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { SearchForm } from '@/components/ui/search-form';
import { listCategories, listProducts } from '@/lib/api';
import { siteConfig } from '@/lib/site';

/**
 * Home (brandbook §12): abre com o Radar — o que está subindo agora — e alterna ritmos
 * (destaque assimétrico, ranking, blocos de cor, trilho, faixa escura) para não virar uma
 * grade genérica. Toda seção sem dados reais simplesmente não aparece.
 */
export default async function HomePage() {
  const [featured, trending, recent, offers, popular, categories] = await Promise.all([
    listProducts({ section: 'featured', limit: 5 }),
    listProducts({ section: 'trending', limit: 5 }),
    listProducts({ section: 'recent', limit: 8 }),
    listProducts({ section: 'offers', limit: 4 }),
    listProducts({ section: 'popular', limit: 4 }),
    listCategories(),
  ]);

  const radar = featured.items.slice(0, 2);
  const ticker = trending.items.map((p) => p.name);

  return (
    <>
      <Fita
        items={ticker.length ? ticker : ['Em alta', 'Achadinhos', 'Vale a pena', 'Preço conferido']}
      />

      {/* ─── Radar ─────────────────────────────────────────── */}
      <Container className="grid items-center gap-10 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-16">
        <div>
          <p className="label text-electric-deep">Curadoria ViraTrend</p>
          <h1 className="display mt-4 mb-7 text-[44px] sm:text-6xl lg:text-7xl">
            Produtos que viralizam. <span className="mark">Achados</span> que valem a pena.
          </h1>
          <SearchForm />
          {categories.length > 0 && (
            <nav aria-label="Categorias populares" className="mt-4 flex flex-wrap gap-2">
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className="rounded-full border border-linha bg-white px-3 py-1.5 text-sm font-medium hover:border-midnight"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {radar.length ? (
          <div className="relative mx-auto h-[500px] w-full max-w-[420px]">
            {radar.map((p, i) => (
              <div
                key={p.slug}
                className={`absolute w-[62%] ${i === 0 ? 'top-10 left-0 -rotate-[5deg]' : 'top-0 right-0 z-10 rotate-[3deg]'}`}
              >
                <ProductCard product={p} priority headingLevel={2} />
              </div>
            ))}
            {offers.total > 0 && (
              <Link
                href="/ofertas"
                className="absolute bottom-0 left-0 z-20 flex items-center gap-3 rounded-m bg-midnight px-4 py-3 text-off shadow-[4px_4px_0_var(--color-electric)]"
              >
                <span className="tabular text-2xl font-bold text-lime">{offers.total}</span>
                <span className="label text-[10px] leading-tight text-nevoa-claro">
                  ofertas conferidas
                  <br />
                  nos últimos 7 dias
                </span>
              </Link>
            )}
          </div>
        ) : (
          <Selo className="mx-auto w-56" />
        )}
      </Container>

      {/* ─── Escolhas da curadoria (destaques) ─────────────── */}
      {featured.items.length > 0 && (
        <Container className="py-10">
          <SectionHeader eyebrow="Destaques" title="Escolhas da curadoria" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {featured.items.map((p, i) => (
              <div key={p.slug} className={i === 0 ? 'col-span-2 md:row-span-2' : ''}>
                <ProductCard product={p} size={i === 0 ? 'lg' : 'md'} />
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* ─── Em alta (ranking) ─────────────────────────────── */}
      {trending.items.length > 0 && (
        <Container className="py-10">
          <SectionHeader
            eyebrow="Em alta"
            title={
              <>
                O que está <span className="mark">virando</span>
              </>
            }
            href="/em-alta"
          />
          <RankList products={trending.items} />
        </Container>
      )}

      {/* ─── Categorias ────────────────────────────────────── */}
      {categories.length > 0 && (
        <Container className="py-10">
          <SectionHeader eyebrow="Categorias" title="Explore por assunto" href="/categorias" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((c) => (
              <CategoryTile key={c.slug} category={c} />
            ))}
          </div>
        </Container>
      )}

      {/* ─── Achadinhos recentes ───────────────────────────── */}
      {recent.items.length > 0 && (
        <Container className="py-10">
          <SectionHeader eyebrow="Achadinhos" title="Acabaram de chegar" />
          <ProductRail>
            {recent.items.map((p) => (
              <RailItem key={p.slug}>
                <ProductCard product={p} />
              </RailItem>
            ))}
          </ProductRail>
        </Container>
      )}

      {/* ─── Ofertas selecionadas (faixa escura) ───────────── */}
      {offers.items.length > 0 && (
        <section className="mt-10 bg-midnight py-14 text-off">
          <Container>
            <SectionHeader
              dark
              eyebrow="Ofertas"
              title="Preço conferido, sem pressa falsa"
              href="/ofertas"
              hrefLabel="Todas as ofertas"
            />
            <p className="-mt-3 mb-6 max-w-xl text-sm text-nevoa-claro">
              Só entram ofertas que conferimos na loja nos últimos 7 dias. Preço anterior aparece
              apenas quando temos o registro.
            </p>
            <ProductRail>
              {offers.items.map((p) => (
                <RailItem key={p.slug}>
                  <div className="text-midnight">
                    <ProductCard product={p} />
                  </div>
                </RailItem>
              ))}
            </ProductRail>
          </Container>
        </section>
      )}

      {/* ─── Populares (cliques reais) ─────────────────────── */}
      {popular.items.length > 0 && (
        <Container className="py-14">
          <SectionHeader eyebrow="Populares" title="Mais clicados no mês" />
          <ProductRail>
            {popular.items.map((p) => (
              <RailItem key={p.slug}>
                <ProductCard product={p} />
              </RailItem>
            ))}
          </ProductRail>
        </Container>
      )}

      {/* ─── CTA redes sociais ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-lime">
        <Container className="grid items-center gap-8 py-14 md:grid-cols-[1fr_auto]">
          <div>
            <p className="label">Nas redes</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">
              Viu, viralizou,{' '}
              <span className="bg-midnight px-[0.15em] text-lime">a gente conta.</span>
            </h2>
            <p className="mt-4 max-w-lg">
              Vídeos curtos com o que está em alta, por que vale (ou não) e onde está mais barato.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {siteConfig.social.length ? (
                siteConfig.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    className={buttonClass.store}
                  >
                    {s.label} <Tri />
                  </a>
                ))
              ) : (
                <span className="label rounded-s bg-midnight px-4 py-3 text-lime">
                  Perfis chegando em breve
                </span>
              )}
            </div>
          </div>
          <Selo className="w-40 md:w-52" />
        </Container>
      </section>
    </>
  );
}
