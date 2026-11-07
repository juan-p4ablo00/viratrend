'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatBRL } from '@viratrend/shared';
import { Alert, Input, Loading, PageTitle, Select } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { useAdminData } from '@/lib/admin-api';
import { statusLabel, type AdminProductRow, type ProductStatus } from '@/lib/admin-types';

const statusTone: Record<ProductStatus, 'alta' | 'line' | 'dark'> = {
  ACTIVE: 'alta',
  DRAFT: 'line',
  ARCHIVED: 'dark',
};

export default function ProductsPage() {
  const [filters, setFilters] = useState({ status: '', q: '', page: 1 });
  const qs = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
  const { data, error, loading } = useAdminData<{
    items: AdminProductRow[];
    total: number;
    limit: number;
  }>(`/admin/products?${qs}`);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <>
      <PageTitle
        eyebrow="Catálogo"
        title="Produtos"
        actions={
          <Link href="/admin/produtos/novo" className={`${buttonClass.primary} h-10 px-5 text-sm`}>
            Novo produto
          </Link>
        }
      />
      <form
        className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px]"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setFilters({ status: String(fd.get('status')), q: String(fd.get('q')).trim(), page: 1 });
        }}
      >
        <Input
          label="Buscar por nome ou slug"
          name="q"
          defaultValue={filters.q}
          placeholder="Ex.: fone"
        />
        <Select
          label="Situação"
          name="status"
          defaultValue={filters.status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="">Rascunhos e publicados</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="ACTIVE">Publicados</option>
          <option value="ARCHIVED">Arquivados</option>
        </Select>
      </form>

      {loading && !data && <Loading />}
      {error && <Alert>{error.message}</Alert>}
      {data && (
        <div className="overflow-x-auto rounded-l border border-linha bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="label border-b border-linha text-left text-nevoa">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3">Preço principal</th>
                <th className="px-4 py-3 text-right">Fotos · Lojas · Cliques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linha">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-off">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="font-semibold hover:text-electric-deep"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-1 flex gap-1.5">
                      {p.isFeatured && <Badge tone="achado">Destaque</Badge>}
                      {p.isTrending && <Badge tone="alta">Em alta</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                  </td>
                  <td className="tabular px-4 py-3">
                    {p.links[0]?.priceCents
                      ? `${formatBRL(p.links[0].priceCents)} · ${p.links[0].store.name}`
                      : '—'}
                  </td>
                  <td className="tabular px-4 py-3 text-right">
                    {p._count.images} · {p._count.links} · {p._count.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && (
            <p className="p-6 text-nevoa">Nenhum produto com esses filtros.</p>
          )}
        </div>
      )}
      {data && pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className={`${buttonClass.ghost} disabled:opacity-40`}
          >
            ← Anterior
          </button>
          <span className="label text-nevoa">
            {filters.page} de {pages}
          </span>
          <button
            type="button"
            disabled={filters.page >= pages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className={`${buttonClass.ghost} disabled:opacity-40`}
          >
            Próxima →
          </button>
        </div>
      )}
    </>
  );
}
