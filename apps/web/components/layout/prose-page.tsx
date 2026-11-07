import { Container } from './section';

/** Páginas institucionais: título display + texto longo legível (≈70 caracteres por linha). */
export function ProsePage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-10 md:py-16">
      <p className="label text-electric-deep">{eyebrow}</p>
      <h1 className="display mt-3 max-w-4xl text-5xl md:text-7xl">{title}</h1>
      {updated && <p className="label mt-4 text-nevoa">Atualizado em {updated}</p>}
      <div className="mt-10 max-w-[68ch] space-y-5 text-[17px] leading-relaxed [&_a]:text-electric-deep [&_a]:underline [&_h2]:display [&_h2]:pt-6 [&_h2]:text-3xl [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold">
        {children}
      </div>
    </Container>
  );
}
