'use client';

import { useState } from 'react';
import { formatBRL, OFFER_MAX_AGE_DAYS, parseBRLToCents } from '@viratrend/shared';
import { Alert, Button, Input, Select } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { adminFetch, AdminApiError, useAdminData } from '@/lib/admin-api';
import {
  offerLabel,
  type AffiliateLink,
  type OfferStatus,
  type PriceEntry,
  type Store,
} from '@/lib/admin-types';

const dt = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));

/** Links de afiliado do produto: um por loja, um principal, preço com histórico, situação da oferta. */
export function ProductLinks({
  productId,
  links,
  onChange,
}: {
  productId: number;
  links: AffiliateLink[];
  onChange: () => void;
}) {
  const stores = useAdminData<{ items: Store[] }>('/admin/stores');
  const [error, setError] = useState<string | null>(null);
  const used = new Set(links.map((l) => l.store.id));
  const available = stores.data?.items.filter((s) => s.isActive && !used.has(s.id)) ?? [];

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      await adminFetch(`/admin/products/${productId}/links`, 'POST', {
        storeId: Number(fd.get('storeId')),
        url: String(fd.get('url') ?? '').trim(),
      });
      form.reset();
      setError(null);
      onChange();
    } catch (err) {
      const e2 = err as AdminApiError;
      setError(e2.fieldErrors.url?.[0] ?? e2.message);
    }
  }

  return (
    <div className="space-y-4">
      {links.length === 0 && <p className="text-sm text-nevoa">Nenhuma loja ainda.</p>}
      {links.map((l) => (
        <LinkRow key={l.id} link={l} onChange={onChange} onError={setError} />
      ))}
      {error && <Alert>{error}</Alert>}
      {available.length > 0 ? (
        <form
          onSubmit={add}
          noValidate
          className="grid gap-3 rounded-m bg-off p-4 sm:grid-cols-[180px_1fr_auto] sm:items-end"
        >
          <Select label="Loja" name="storeId" defaultValue={available[0]?.id}>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input label="Link de afiliado (https)" name="url" type="url" placeholder="https://…" />
          <Button type="submit" variant="secondary">
            Adicionar loja
          </Button>
        </form>
      ) : (
        stores.data && (
          <p className="text-sm text-nevoa">Todas as lojas ativas já têm link neste produto.</p>
        )
      )}
    </div>
  );
}

function LinkRow({
  link,
  onChange,
  onError,
}: {
  link: AffiliateLink;
  onChange: () => void;
  onError: (m: string | null) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    try {
      await adminFetch(`/admin/links/${link.id}`, 'PATCH', body);
      onError(null);
      onChange();
    } catch (err) {
      onError((err as AdminApiError).message);
    }
  }

  async function recordPrice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const cents = parseBRLToCents(String(fd.get('price') ?? ''));
    if (!cents) return setPriceError('Use o formato 89,90 ou 1.299,90');
    try {
      await adminFetch(`/admin/links/${link.id}/prices`, 'POST', {
        priceCents: cents,
        source: String(fd.get('source') ?? '').trim() || null,
      });
      form.reset();
      setPriceError(null);
      onChange();
    } catch (err) {
      setPriceError((err as AdminApiError).message);
    }
  }

  async function editUrl() {
    const url = prompt('Nova URL de afiliado (https):', link.url);
    if (url && url !== link.url) await patch({ url: url.trim() });
  }

  return (
    <article
      className={`rounded-m border p-4 ${link.isActive ? 'border-linha bg-white' : 'border-dashed border-linha bg-off opacity-80'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-bold">{link.store.name}</h3>
        {link.isPrimary && <Badge tone="achado">Principal</Badge>}
        {!link.isActive && <Badge tone="line">Desativado</Badge>}
        {link.offerStatus === 'VERIFIED' && <Badge tone="dark">Oferta conferida</Badge>}
      </div>
      <p className="mt-1 truncate text-sm text-nevoa" title={link.url}>
        {link.url}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span>
          Preço atual:{' '}
          <strong className="tabular">
            {link.priceCents ? formatBRL(link.priceCents) : 'não registrado'}
          </strong>
          {link.priceCheckedAt && (
            <span className="text-nevoa"> · conferido {dt(link.priceCheckedAt)}</span>
          )}
        </span>
        {link.offerCheckedAt && (
          <span className="text-nevoa">
            Oferta conferida em {dt(link.offerCheckedAt)} (vale {OFFER_MAX_AGE_DAYS} dias no site)
          </span>
        )}
      </div>

      <form
        onSubmit={recordPrice}
        noValidate
        className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end"
      >
        <Input
          label="Novo preço (R$)"
          name="price"
          inputMode="decimal"
          placeholder="89,90"
          error={priceError ? [priceError] : undefined}
        />
        <Input label="Como foi conferido" name="source" placeholder="Página da loja em 06/11" />
        <Button type="submit" variant="ghost">
          Registrar preço
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select
          label="Situação da oferta"
          name={`offer-${link.id}`}
          value={link.offerStatus}
          onChange={(e) => patch({ offerStatus: e.currentTarget.value as OfferStatus })}
          className="w-48"
        >
          {(['NONE', 'VERIFIED', 'EXPIRED'] as const).map((s) => (
            <option key={s} value={s}>
              {offerLabel[s]}
            </option>
          ))}
        </Select>
        {!link.isPrimary && link.isActive && (
          <Button variant="ghost" onClick={() => patch({ isPrimary: true })}>
            Tornar principal
          </Button>
        )}
        <Button variant="ghost" onClick={editUrl}>
          Trocar URL
        </Button>
        <Button
          variant={link.isActive ? 'danger' : 'ghost'}
          onClick={() => patch({ isActive: !link.isActive })}
        >
          {link.isActive ? 'Desativar (expirado)' : 'Reativar'}
        </Button>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="label ml-auto py-2 text-electric-deep"
        >
          {showHistory ? 'Ocultar histórico' : 'Histórico de preços'}
        </button>
      </div>
      {showHistory && <PriceHistory linkId={link.id} />}
    </article>
  );
}

function PriceHistory({ linkId }: { linkId: number }) {
  const { data, error } = useAdminData<{ items: PriceEntry[] }>(`/admin/links/${linkId}/prices`);
  if (error) return <Alert>{error.message}</Alert>;
  if (!data) return null;
  if (!data.items.length)
    return <p className="mt-3 text-sm text-nevoa">Nenhum preço registrado.</p>;
  return (
    <table className="mt-3 w-full text-sm">
      <thead>
        <tr className="label text-left text-nevoa">
          <th className="py-2">Data</th>
          <th>Preço</th>
          <th>Fonte</th>
          <th>Por</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-linha">
        {data.items.map((p) => (
          <tr key={p.id}>
            <td className="py-2">{dt(p.checkedAt)}</td>
            <td className="tabular font-semibold">{formatBRL(p.priceCents)}</td>
            <td className="text-nevoa">{p.source ?? '—'}</td>
            <td className="text-nevoa">{p.recordedBy?.name ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
