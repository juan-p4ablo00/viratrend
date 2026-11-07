import { formatBRL } from '@viratrend/shared';

export { formatBRL };

// Estilo curto ("há 27 min.") cabe em uma linha nos cards estreitos do celular.
const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto', style: 'short' });

/** "há 2 horas", "ontem"… — usado em "preço conferido há X". */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 30],
    ['month', 12],
  ];
  let value = diff;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit);
    value /= size;
  }
  return rtf.format(Math.round(value), 'year');
}

/** Data e hora curtas: "06/11, 14:05". */
export function shortDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));
}
