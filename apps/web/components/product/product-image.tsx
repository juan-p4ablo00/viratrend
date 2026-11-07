import Image from 'next/image';
import type { PublicImage } from '@viratrend/shared';
import { Logo } from '@/components/brand/logo';
import { categoryTheme } from '@/lib/category-theme';

// Hosts otimizados pelo next/image (mesma lista do next.config). Outros hosts são exibidos
// sem otimização em vez de quebrar a página.
const optimizedHosts = (process.env.IMAGE_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);
const isOptimized = (url: string) => {
  try {
    return optimizedHosts.includes(new URL(url).hostname);
  } catch {
    return false;
  }
};

/**
 * Imagem de produto em quadro quadrado. Sem foto: bloco da cor da categoria com o símbolo —
 * nunca uma ilustração que pareça o produto.
 */
export function ProductImage({
  image,
  categorySlug,
  sizes,
  priority = false,
}: {
  image: PublicImage | null;
  categorySlug: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!image) {
    const theme = categoryTheme(categorySlug);
    return (
      <div className={`grid size-full place-items-center ${theme.bg}`}>
        <Logo
          variant="symbol"
          tone={theme.fg === 'text-midnight' ? 'light' : 'dark'}
          className="w-1/4 opacity-25"
        />
        <span className="sr-only">Produto sem foto</span>
      </div>
    );
  }
  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!isOptimized(image.url)}
      className="object-contain p-[8%]"
    />
  );
}
