'use client';

import { useState } from 'react';
import { z } from 'zod';
import { productCreateSchema } from '@viratrend/shared';
import {
  Alert,
  Button,
  Checkbox,
  Input,
  optionalText,
  Select,
  TextArea,
} from '@/components/admin/ui';
import { adminFetch, AdminApiError, useAdminData } from '@/lib/admin-api';
import type { AdminProduct, Category } from '@/lib/admin-types';

type Errors = Record<string, string[] | undefined>;

/**
 * Dados editoriais do produto (criar e editar usam o mesmo formulário).
 * Valida no navegador com o mesmo schema da API; a API valida de novo e decide.
 */
export function ProductForm({
  product,
  onSaved,
}: {
  product?: AdminProduct;
  onSaved: (p: AdminProduct) => void;
}) {
  const categories = useAdminData<{ items: Category[] }>('/admin/categories');
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = {
      name: String(fd.get('name') ?? ''),
      slug: optionalText(fd, 'slug') ?? undefined,
      summary: optionalText(fd, 'summary'),
      description: String(fd.get('description') ?? ''),
      curatorNote: optionalText(fd, 'curatorNote'),
      keywords: optionalText(fd, 'keywords'),
      categoryId: Number(fd.get('categoryId')),
      isFeatured: fd.get('isFeatured') === 'on',
      isTrending: fd.get('isTrending') === 'on',
    };
    const parsed = productCreateSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      setMessage({ tone: 'error', text: 'Revise os campos destacados.' });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const saved = product
        ? await adminFetch<AdminProduct>(`/admin/products/${product.id}`, 'PATCH', parsed.data)
        : await adminFetch<AdminProduct>('/admin/products', 'POST', parsed.data);
      setMessage({ tone: 'ok', text: 'Salvo.' });
      onSaved(saved);
    } catch (err) {
      const apiErr = err as AdminApiError;
      setErrors(apiErr.fieldErrors);
      setMessage({ tone: 'error', text: apiErr.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-2">
      <Input
        label="Nome"
        name="name"
        defaultValue={product?.name}
        error={errors.name}
        required
        className="md:col-span-2"
      />
      <Select
        label="Categoria"
        name="categoryId"
        defaultValue={product?.categoryId ?? ''}
        error={errors.categoryId}
        required
      >
        <option value="" disabled>
          Escolha…
        </option>
        {categories.data?.items.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.isActive ? '' : ' (inativa)'}
          </option>
        ))}
      </Select>
      <Input
        label="Slug (URL)"
        name="slug"
        defaultValue={product?.slug}
        error={errors.slug}
        hint={
          product
            ? 'Mudar o slug quebra links já compartilhados.'
            : 'Vazio = gerado a partir do nome.'
        }
      />
      <Input
        label="Resumo (aparece no card)"
        name="summary"
        defaultValue={product?.summary ?? ''}
        error={errors.summary}
        maxLength={300}
        className="md:col-span-2"
      />
      <TextArea
        label="Descrição"
        name="description"
        defaultValue={product?.description}
        error={errors.description}
        rows={6}
        required
        className="md:col-span-2"
      />
      <TextArea
        label="Por que vale (curadoria)"
        name="curatorNote"
        defaultValue={product?.curatorNote ?? ''}
        error={errors.curatorNote}
        hint="Opinião honesta: para quem serve, para quem não serve."
        className="md:col-span-2"
      />
      <Input
        label="Palavras-chave da busca"
        name="keywords"
        defaultValue={product?.keywords ?? ''}
        error={errors.keywords}
        hint="Termos que as pessoas digitam e não estão no nome. Ex.: sem fio, bluetooth"
        className="md:col-span-2"
      />
      <div className="flex flex-wrap gap-6 md:col-span-2">
        <Checkbox label="Destaque na home" name="isFeatured" defaultChecked={product?.isFeatured} />
        <Checkbox label="Em alta" name="isTrending" defaultChecked={product?.isTrending} />
      </div>
      {message && (
        <div className="md:col-span-2">
          <Alert tone={message.tone}>{message.text}</Alert>
        </div>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : product ? 'Salvar alterações' : 'Criar rascunho'}
        </Button>
      </div>
    </form>
  );
}
