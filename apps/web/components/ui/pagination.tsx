import Link from 'next/link';

/** Paginação simples por links (indexável, sem JS). `params` preserva filtros da URL. */
export function Pagination({
  page,
  total,
  limit,
  basePath,
  params = {},
}: {
  page: number;
  total: number;
  limit: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams(
      Object.entries({ ...params, page: p > 1 ? String(p) : undefined }).filter(
        (e): e is [string, string] => !!e[1],
      ),
    ).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const cls =
    'label rounded-s border-[1.5px] border-midnight px-4 py-3 hover:bg-midnight hover:text-off';
  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-3">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={cls}>
          ← Anterior
        </Link>
      )}
      <span className="label text-nevoa">
        {page} de {pages}
      </span>
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className={cls}>
          Próxima →
        </Link>
      )}
    </nav>
  );
}

/** Lê ?page= com segurança (sempre ≥ 1). */
export const parsePage = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 && n <= 500 ? n : 1;
};
