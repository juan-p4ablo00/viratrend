/**
 * Cliente da API para Server Components. Roda só no servidor do Next: API_URL não tem
 * prefixo NEXT_PUBLIC_ e por isso nem existe no navegador.
 *
 * Cache: ISR de 60 s por requisição. Se a API estiver fora do ar, as listagens degradam para
 * vazio (a seção some) em vez de derrubar a página; o detalhe de produto responde 404.
 */
import type {
  Paginated,
  PublicCategory,
  PublicListQuery,
  PublicProductCard,
  PublicProductDetail,
} from '@viratrend/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const REVALIDATE = 60;

class ApiNotFound extends Error {}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE } });
  if (res.status === 404) throw new ApiNotFound(path);
  if (!res.ok) throw new Error(`API ${res.status} em ${path}`);
  return res.json() as Promise<T>;
}

/** Listagem nunca derruba a página: em erro, loga e devolve vazio. */
async function safe<T>(path: string, empty: T): Promise<T> {
  try {
    return await get<T>(path);
  } catch (err) {
    console.error('[api]', err instanceof Error ? err.message : err);
    return empty;
  }
}

const emptyPage = <T>(): Paginated<T> => ({ items: [], page: 1, limit: 0, total: 0 });

export function listProducts(query: Partial<PublicListQuery> = {}) {
  const qs = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
  return safe<Paginated<PublicProductCard>>(`/public/products?${qs}`, emptyPage());
}

export async function listCategories() {
  return (await safe<{ items: PublicCategory[] }>('/public/categories', { items: [] })).items;
}

/** null = não existe (a página chama notFound()). Outros erros sobem para o error boundary. */
export async function getProduct(slug: string): Promise<PublicProductDetail | null> {
  try {
    return await get<PublicProductDetail>(`/public/products/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiNotFound) return null;
    throw err;
  }
}

export type SitemapData = {
  products: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
};

export const getSitemapData = () =>
  safe<SitemapData>('/public/sitemap', { products: [], categories: [] });
