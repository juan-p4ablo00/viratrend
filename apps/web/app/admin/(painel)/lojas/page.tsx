'use client';

import { useState } from 'react';
import { z } from 'zod';
import { storeCreateSchema } from '@viratrend/shared';
import { useAdminUser } from '@/components/admin/admin-shell';
import {
  Alert,
  Button,
  Checkbox,
  Input,
  Loading,
  optionalText,
  PageTitle,
} from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { adminFetch, AdminApiError, useAdminData } from '@/lib/admin-api';
import type { Store } from '@/lib/admin-types';

type Errors = Record<string, string[] | undefined>;

/** Lojas parceiras. Editores só visualizam; criar e editar é de administradores (regra da API). */
export default function StoresPage() {
  const user = useAdminUser();
  const canEdit = user.role === 'ADMIN';
  const { data, error, reload } = useAdminData<{ items: Store[] }>('/admin/stores');
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>, s?: Store) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = storeCreateSchema.safeParse({
      name: String(fd.get('name') ?? ''),
      slug: optionalText(fd, 'slug') ?? undefined,
      websiteUrl: String(fd.get('websiteUrl') ?? '').trim(),
      isActive: fd.get('isActive') === 'on',
    });
    if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors);
    try {
      await adminFetch(
        s ? `/admin/stores/${s.id}` : '/admin/stores',
        s ? 'PATCH' : 'POST',
        parsed.data,
      );
      setEditing(null);
      setErrors({});
      setMessage(null);
      void reload();
    } catch (err) {
      const apiErr = err as AdminApiError;
      setErrors(apiErr.fieldErrors);
      setMessage(apiErr.message);
    }
  }

  const fields = (s?: Store) => (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
      <Input label="Nome" name="name" defaultValue={s?.name} error={errors.name} />
      <Input label="Slug" name="slug" defaultValue={s?.slug} error={errors.slug} />
      <Input
        label="Site (https)"
        name="websiteUrl"
        type="url"
        defaultValue={s?.websiteUrl}
        error={errors.websiteUrl}
      />
      <Checkbox label="Ativa" name="isActive" defaultChecked={s?.isActive ?? true} />
    </div>
  );

  return (
    <>
      <PageTitle
        eyebrow="Parceiros"
        title="Lojas"
        actions={
          canEdit &&
          editing !== 'new' && <Button onClick={() => setEditing('new')}>Nova loja</Button>
        }
      />
      {!canEdit && (
        <div className="mb-4">
          <Alert tone="info">Somente administradores cadastram ou alteram lojas.</Alert>
        </div>
      )}
      {message && (
        <div className="mb-4">
          <Alert>{message}</Alert>
        </div>
      )}
      {editing === 'new' && (
        <form
          onSubmit={(e) => save(e)}
          noValidate
          className="mb-6 space-y-4 rounded-l border border-linha bg-white p-5"
        >
          {fields()}
          <div className="flex gap-2">
            <Button type="submit">Criar</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
      {error && <Alert>{error.message}</Alert>}
      {!data ? (
        <Loading />
      ) : (
        <ul className="space-y-3">
          {data.items.map((s) => (
            <li key={s.id} className="rounded-l border border-linha bg-white p-4">
              {editing === s.id ? (
                <form onSubmit={(e) => save(e, s)} noValidate className="space-y-4">
                  {fields(s)}
                  <div className="flex gap-2">
                    <Button type="submit">Salvar</Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-nevoa">{s.websiteUrl}</p>
                  </div>
                  <Badge tone={s.isActive ? 'alta' : 'line'}>
                    {s.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                  {canEdit && (
                    <Button variant="ghost" onClick={() => setEditing(s.id)}>
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
