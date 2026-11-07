import Link from 'next/link';
import type { PublicCategory } from '@viratrend/shared';
import { categoryTheme } from '@/lib/category-theme';

/** Bloco de categoria: cor-base fixa + Quina + contagem real de produtos publicados. */
export function CategoryTile({
  category,
  tall = false,
}: {
  category: PublicCategory;
  tall?: boolean;
}) {
  const t = categoryTheme(category.slug);
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className={`lift quina relative flex flex-col justify-between rounded-m p-4 [--q:20px] ${t.bg} ${t.fg} ${tall ? 'min-h-44' : 'min-h-28'} ${t.bg === 'bg-white' ? 'border border-linha' : ''}`}
    >
      <span className="font-display text-lg leading-tight font-bold [font-stretch:85%]">
        {category.name}
      </span>
      <span className="label opacity-70">
        {category.productCount} {category.productCount === 1 ? 'item' : 'itens'}
      </span>
    </Link>
  );
}
