'use client';

import Link from 'next/link';
import { Alert, Loading, PageTitle, Panel } from '@/components/admin/ui';
import { buttonClass } from '@/components/ui/button';
import { useAdminData } from '@/lib/admin-api';
import type { Dashboard } from '@/lib/admin-types';

function Stat({
  label,
  value,
  tone = 'white',
}: {
  label: string;
  value: number;
  tone?: 'white' | 'lime' | 'dark';
}) {
  const c =
    tone === 'lime'
      ? 'bg-lime'
      : tone === 'dark'
        ? 'bg-midnight text-off'
        : 'bg-white border border-linha';
  return (
    <div className={`quina rounded-l p-5 [--q:18px] ${c}`}>
      <p className="label opacity-70">{label}</p>
      <p className="tabular mt-3 text-4xl font-bold tracking-tight">
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, loading } = useAdminData<Dashboard>('/admin/dashboard');

  return (
    <>
      <PageTitle
        eyebrow="Visão geral"
        title="Dashboard"
        actions={
          <Link href="/admin/produtos/novo" className={`${buttonClass.primary} h-10 px-5 text-sm`}>
            Novo produto
          </Link>
        }
      />
      {loading && <Loading />}
      {error && <Alert>{error.message}</Alert>}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Produtos (sem arquivados)" value={data.products.total} />
            <Stat label="Publicados" value={data.products.active} tone="lime" />
            <Stat label="Em destaque" value={data.products.featured} />
            <Stat label="Categorias" value={data.categories} />
            <Stat label="Em alta" value={data.products.trending} />
            <Stat label="Cliques (30 dias)" value={data.clicks.last30d} tone="dark" />
            <Stat label="Cliques (total)" value={data.clicks.total} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Panel title="Mais clicados — 30 dias">
              {data.topProducts30d.length ? (
                <ol className="divide-y divide-linha">
                  {data.topProducts30d.map((p, i) => (
                    <li key={p.productId} className="flex items-center gap-4 py-3">
                      <span className="display w-8 text-2xl text-electric">{i + 1}</span>
                      <Link
                        href={`/admin/produtos/${p.productId}`}
                        className="flex-1 font-medium hover:text-electric-deep"
                      >
                        {p.name ?? `Produto #${p.productId} (fora do site)`}
                      </Link>
                      <span className="tabular font-bold">{p.clicks}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-nevoa">Ainda sem cliques no período.</p>
              )}
            </Panel>
            <Panel title="Cliques por loja — 30 dias">
              {data.clicks.byStore30d.length ? (
                <ul className="space-y-3">
                  {data.clicks.byStore30d.map((s) => {
                    const pct = data.clicks.last30d ? (s.clicks / data.clicks.last30d) * 100 : 0;
                    return (
                      <li key={s.store}>
                        <div className="flex justify-between text-sm font-medium">
                          <span>{s.store}</span>
                          <span className="tabular">{s.clicks}</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-off">
                          <div
                            className="h-2 rounded-full bg-electric"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-nevoa">Sem cliques no período.</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
