import Link from 'next/link';

/** Cabeçalho de seção: eyebrow mono + título display + link "ver tudo" opcional. */
export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = 'Ver tudo',
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className={`label ${dark ? 'text-lime' : 'text-electric-deep'}`}>{eyebrow}</p>
        <h2 className="display mt-2 text-4xl md:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="label shrink-0 border-b-2 border-current pb-0.5 hover:text-electric-deep"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

export const Container = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`mx-auto max-w-6xl px-4 md:px-8 ${className}`}>{children}</div>;

/** Grade responsiva de cards: 2 colunas no celular, 3–4 no desktop. */
export const ProductGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{children}</div>
);

/** Trilho horizontal com scroll-snap (mobile) que vira grade no desktop. */
export const ProductRail = ({ children }: { children: React.ReactNode }) => (
  <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
    {children}
  </div>
);
export const RailItem = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-auto">{children}</div>
);
