const tones = {
  alta: 'bg-lime text-midnight',
  achado: 'bg-electric-deep text-white', // contraste AA (6,2:1)
  queda: 'bg-brasa text-midnight', // só com queda de preço comprovada
  dark: 'bg-midnight text-lime',
  line: 'border-[1.5px] border-linha text-nevoa',
} as const;

export function Badge({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span
      className={`label inline-flex items-center gap-1.5 rounded-s px-2 py-1.5 leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Loja: chip de contorno com nome por extenso — sem logos de terceiros. */
export function StoreChip({ name }: { name: string }) {
  return (
    <span className="label inline-flex h-6 items-center rounded-full border-[1.5px] border-current px-2.5 text-nevoa">
      {name}
    </span>
  );
}

/** Triângulo-salto usado como marcador/separador (◥). */
export const Tri = ({ className = '' }: { className?: string }) => (
  <i
    aria-hidden
    className={`inline-block size-[0.62em] bg-current [clip-path:polygon(0_0,100%_0,100%_100%)] ${className}`}
  />
);
