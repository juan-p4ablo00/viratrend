// Fase 2 (fundação): a home real — Radar, categorias, listas — chega na Fase 4 com dados da API.
// Esta página só comprova tokens, fontes e logotipo em produção.
export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <p className="tabular text-xs font-semibold tracking-[0.14em] text-electric-deep uppercase">
        Em construção
      </p>
      <h1 className="display mt-4 text-5xl md:text-8xl">
        Produtos que viralizam.{' '}
        <span className="bg-[linear-gradient(transparent_58%,var(--color-lime)_58%_92%,transparent_0)]">
          Achados
        </span>{' '}
        que valem a pena.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-nevoa">
        A curadoria da ViraTrend está sendo montada. Em breve: o que está em alta, com preço
        conferido e loja de origem.
      </p>
    </section>
  );
}
