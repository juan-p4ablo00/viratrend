/**
 * Logotipo oficial — geometria copiada sem alterações de docs/brand/ViraTrend-Identidade.html
 * (símbolo "Quina" 100u + wordmark em traço 13u). Não redesenhar aqui.
 */
type Tone = 'light' | 'dark';

const COLORS: Record<Tone, { body: string; spark: string; word: string; dot: string }> = {
  light: { body: '#101426', spark: '#765BFF', word: '#101426', dot: '#765BFF' }, // sobre fundo claro
  dark: { body: '#C8F36A', spark: '#765BFF', word: '#F5F4F0', dot: '#C8F36A' }, // sobre fundo escuro
};

function Symbol({ c }: { c: (typeof COLORS)[Tone] }) {
  return (
    <>
      <path
        fill={c.body}
        d="M0 16C0 7.2 7.2 0 16 0H56L100 44V84C100 92.8 92.8 100 84 100H16C7.2 100 0 92.8 0 84Z"
      />
      <path fill={c.spark} d="M64 -8H108V36Z" />
    </>
  );
}

function Wordmark({ c }: { c: (typeof COLORS)[Tone] }) {
  return (
    <>
      <polygon fill={c.word} points="0,43.5 14.5,43.5 24,78 33.5,43.5 48,43.5 31,100.5 17,100.5" />
      <g fill="none" stroke={c.word} strokeWidth="13">
        <path d="M62.5 43.5V100.5" />
        <path d="M83.5 43.5V100.5M83.5 72A22 22 0 0 1 105.5 50" />
        <circle cx="140" cy="72" r="22" />
        <path d="M162 43.5V100.5" />
        <path d="M190.5 26V100.5M175.5 50H207.5" />
        <path d="M219.5 43.5V100.5M219.5 72A22 22 0 0 1 241.5 50" />
        <path d="M254 72H298M298 72A22 22 0 1 0 291.6 87.6" />
        <path d="M319 43.5V100.5M319 72A22 22 0 0 1 363 72V100.5" />
        <circle cx="406" cy="72" r="22" />
        <path d="M428 20V100.5" />
      </g>
      <polygon fill={c.dot} points="53,15 71,15 71,33" />
    </>
  );
}

export function Logo({
  variant = 'horizontal',
  tone = 'light',
  className,
}: {
  variant?: 'horizontal' | 'symbol';
  tone?: Tone;
  className?: string;
}) {
  const c = COLORS[tone];
  if (variant === 'symbol') {
    return (
      <svg viewBox="0 -8 108 108" className={className} aria-hidden="true">
        <Symbol c={c} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 12 546 92" className={className} role="img" aria-label="ViraTrend">
      <g transform="translate(0 14.1) scale(0.8) translate(0 8)">
        <Symbol c={c} />
      </g>
      <g transform="translate(108 0)">
        <Wordmark c={c} />
      </g>
    </svg>
  );
}
