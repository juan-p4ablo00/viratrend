import { Container } from './section';

/** Topo das páginas internas: eyebrow + título display + texto de apoio. */
export function PageHero({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      <Container className="py-10 md:py-14">
        <p className="label opacity-80">{eyebrow}</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-lg opacity-80">{children}</div>}
      </Container>
    </header>
  );
}

/** Estado vazio honesto: diz o que não há e sugere um caminho. */
export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="quina rounded-l border border-dashed border-linha bg-white px-6 py-14 text-center [--q:28px]">
      <p className="display text-3xl">{title}</p>
      {children && <div className="mx-auto mt-3 max-w-md text-nevoa">{children}</div>}
    </div>
  );
}
