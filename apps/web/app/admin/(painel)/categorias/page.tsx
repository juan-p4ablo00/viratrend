'use client';

import { useState } from 'react';
import { z } from 'zod';
import { categoryCreateSchema } from '@viratrend/shared';
import { useAdminUser } from '@/components/admin/admin-shell';
import {
  Alert,
  Button,
  Checkbox,
  Input,
  Loading,
  optionalText,
  PageTitle,
  Panel,
} from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { adminFetch, AdminApiError, useAdminData } from '@/lib/admin-api';
import type { Category } from '@/lib/admin-types';

type Errors = Record<string, string[] | undefined>;

function readCategory(fd: FormData) {
  return {
    name: String(fd.get('name') ?? ''),
    slug: optionalText(fd, 'slug') ?? undefined,
    description: optionalText(fd, 'description'),
    imageUrl: optionalText(fd, 'imageUrl'),
    sortOrder: Number(fd.get('sortOrder') || 0),
    isActive: fd.get('isActive') === 'on',
  };
}

function CategoryFields({ c, errors }: { c?: Category; errors: Errors }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
      <Input label="Nome" name="name" defaultValue={c?.name} error={errors.name} />
      <Input
        label="Slug"
        name="slug"
        defaultValue={c?.slug}
        error={errors.slug}
        hint={c ? undefined : 'Vazio = gerado do nome'}
      />
      <Input
        label="Ordem"
        name="sortOrder"
        type="number"
        min={0}
        defaultValue={c?.sortOrder ?? 0}
        error={errors.sortOrder}
      />
      <Input
        label="Descrição"
        name="description"
        defaultValue={c?.description ?? ''}
        error={errors.description}
        className="md:col-span-2"
      />
      <Input
        label="Imagem (URL https)"
        name="imageUrl"
        defaultValue={c?.imageUrl ?? ''}
        error={errors.imageUrl}
      />
      <Checkbox label="Ativa no site" name="isActive" defaultChecked={c?.isActive ?? true} />
    </div>
  );
}

export default function CategoriesPage() {
  const user = useAdminUser();
  const { data, error, reload } = useAdminData<{ items: Category[] }>('/admin/categories');
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>, c?: Category) {
    e.preventDefault();
    const parsed = categoryCreateSchema.safeParse(readCategory(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors);
    try {
      await adminFetch(
        c ? `/admin/categories/${c.id}` : '/admin/categories',
        c ? 'PATCH' : 'POST',
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

  async function remove(c: Category) {
    if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
    try {
      await adminFetch(`/admin/categories/${c.id}`, 'DELETE');
      setMessage(null);
      void reload();
    } catch (err) {
      setMessage((err as AdminApiError).message);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="Catálogo"
        title="Categorias"
        actions={
          editing !== 'new' && <Button onClick={() => setEditing('new')}>Nova categoria</Button>
        }
      />
      {message && (
        <div className="mb-4">
          <Alert>{message}</Alert>
        </div>
      )}
      {editing === 'new' && (
        <div className="mb-6">
          <Panel title="Nova categoria">
            <form onSubmit={(e) => save(e)} noValidate className="space-y-4">
              <CategoryFields errors={errors} />
              <div className="flex gap-2">
                <Button type="submit">Criar</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
      {error && <Alert>{error.message}</Alert>}
      {!data ? (
        <Loading />
      ) : (
        <ul className="space-y-3">
          {data.items.map((c) => (
            <li key={c.id} className="rounded-l border border-linha bg-white p-4">
              {editing === c.id ? (
                <form onSubmit={(e) => save(e, c)} noValidate className="space-y-4">
                  <CategoryFields c={c} errors={errors} />
                  <div className="flex gap-2">
                    <Button type="submit">Salvar</Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tabular w-8 text-nevoa">{c.sortOrder}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {c.name} <span className="text-sm font-normal text-nevoa">/{c.slug}</span>
                    </p>
                    {c.description && (
                      <p className="truncate text-sm text-nevoa">{c.description}</p>
                    )}
                  </div>
                  {!c.isActive && <Badge tone="line">Inativa</Badge>}
                  <span className="label text-nevoa">{c._count?.products ?? 0} produtos</span>
                  <Button variant="ghost" onClick={() => setEditing(c.id)}>
                    Editar
                  </Button>
                  {user.role === 'ADMIN' && (
                    <Button
                      variant="danger"
                      disabled={(c._count?.products ?? 0) > 0}
                      title={
                        (c._count?.products ?? 0) > 0
                          ? 'Mova ou arquive os produtos antes, ou desative a categoria'
                          : undefined
                      }
                      onClick={() => remove(c)}
                    >
                      Excluir
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
