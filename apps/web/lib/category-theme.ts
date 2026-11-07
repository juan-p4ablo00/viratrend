/**
 * Regra do brandbook (§12): cada categoria tem uma cor-base fixa.
 * Games e Fitness não estavam no brandbook — proposta registrada em docs/ARCHITECTURE.md §1.1.
 * Categoria nova criada no painel cai no tema neutro até ganhar cor aqui.
 */
export type CategoryTheme = { bg: string; fg: string; spark: string };

const themes: Record<string, CategoryTheme> = {
  // Electric Deep (e não Electric): texto branco pequeno precisa de 4,5:1.
  tecnologia: { bg: 'bg-electric-deep', fg: 'text-white', spark: 'bg-lime' },
  casa: { bg: 'bg-lime', fg: 'text-midnight', spark: 'bg-midnight' },
  beleza: { bg: 'bg-lilas', fg: 'text-midnight', spark: 'bg-electric' },
  moda: { bg: 'bg-white', fg: 'text-midnight', spark: 'bg-electric' },
  utilidades: { bg: 'bg-noite', fg: 'text-off', spark: 'bg-lime' },
  games: { bg: 'bg-midnight', fg: 'text-lime', spark: 'bg-electric' },
  fitness: { bg: 'bg-lime-soft', fg: 'text-midnight', spark: 'bg-midnight' },
};

const neutral: CategoryTheme = { bg: 'bg-off', fg: 'text-midnight', spark: 'bg-electric' };

export const categoryTheme = (slug: string): CategoryTheme => themes[slug] ?? neutral;
