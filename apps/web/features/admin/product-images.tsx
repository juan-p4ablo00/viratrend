'use client';

import { useState } from 'react';
import { z } from 'zod';
import { imageCreateSchema } from '@viratrend/shared';
import { Alert, Button, Input, optionalText } from '@/components/admin/ui';
import { adminFetch, AdminApiError } from '@/lib/admin-api';
import type { ProductImage } from '@/lib/admin-types';

/**
 * Fotos por URL https (storage próprio ainda não definido — docs/ARCHITECTURE.md R3).
 * O campo "crédito" registra a origem/direito de uso de cada imagem.
 */
export function ProductImages({
  productId,
  images,
  onChange,
}: {
  productId: number;
  images: ProductImage[];
  onChange: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = imageCreateSchema.safeParse({
      url: String(fd.get('url') ?? '').trim(),
      alt: String(fd.get('alt') ?? ''),
      credit: optionalText(fd, 'credit'),
      sortOrder: images.length,
    });
    if (!parsed.success) return setErrors(z.flattenError(parsed.error).fieldErrors);
    try {
      await adminFetch(`/admin/products/${productId}/images`, 'POST', parsed.data);
      form.reset();
      setErrors({});
      setError(null);
      onChange();
    } catch (err) {
      setError((err as AdminApiError).message);
    }
  }

  async function remove(id: number) {
    if (!confirm('Remover esta foto?')) return;
    try {
      await adminFetch(`/admin/images/${id}`, 'DELETE');
      onChange();
    } catch (err) {
      setError((err as AdminApiError).message);
    }
  }

  return (
    <div className="space-y-5">
      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="rounded-m border border-linha p-2">
              {/* Pré-visualização interna do painel: <img> simples, sem otimização. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="aspect-square w-full rounded-s bg-off object-contain"
              />
              <p className="label mt-2 text-[10px] text-nevoa">
                {i === 0 ? 'Principal' : `Foto ${i + 1}`}
              </p>
              <p className="truncate text-xs">{img.credit ?? 'sem crédito'}</p>
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="mt-1 text-xs text-[#B5321A] hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-nevoa">
          Sem fotos. Produto precisa de ao menos uma para ser publicado.
        </p>
      )}
      <form
        onSubmit={add}
        noValidate
        className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
      >
        <Input
          label="URL da imagem (https)"
          name="url"
          type="url"
          error={errors.url}
          placeholder="https://…"
        />
        <Input
          label="Texto alternativo"
          name="alt"
          error={errors.alt}
          placeholder="Fone branco no estojo"
        />
        <Input
          label="Crédito / origem"
          name="credit"
          error={errors.credit}
          placeholder="Foto própria"
        />
        <Button type="submit" variant="secondary">
          Adicionar
        </Button>
      </form>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
