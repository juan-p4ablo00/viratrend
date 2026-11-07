'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Loading, PageTitle, Panel } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { adminFetch, AdminApiError, useAdminData } from '@/lib/admin-api';
import { statusLabel, type AdminProduct, type ProductStatus } from '@/lib/admin-types';
import { ProductForm } from '@/features/admin/product-form';
import { ProductImages } from '@/features/admin/product-images';
import { ProductLinks } from '@/features/admin/product-links';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, error, reload } = useAdminData<AdminProduct>(`/admin/products/${id}`);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function setStatus(status: ProductStatus) {
    try {
      if (status === 'ARCHIVED') {
        if (
          !confirm('Arquivar? O produto sai do site, mas cliques e histórico continuam guardados.')
        )
          return;
        await adminFetch(`/admin/products/${id}`, 'DELETE');
      } else {
        await adminFetch(`/admin/products/${id}`, 'PATCH', { status });
      }
      setStatusError(null);
      void reload();
    } catch (err) {
      setStatusError((err as AdminApiError).message);
    }
  }

  if (error) return <Alert>{error.message}</Alert>;
  if (!product) return <Loading />;

  return (
    <>
      <PageTitle
        eyebrow="Produto"
        title={product.name}
        actions={
          <Link href="/admin/produtos" className="label text-nevoa hover:text-midnight">
            ← Todos os produtos
          </Link>
        }
      />

      <div className="space-y-6">
        <Panel>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={product.status === 'ACTIVE' ? 'alta' : 'line'}>
              {statusLabel[product.status]}
            </Badge>
            {product.status === 'ACTIVE' && (
              <a
                href={`/produto/${product.slug}`}
                target="_blank"
                rel="noopener"
                className="label text-electric-deep hover:underline"
              >
                Ver no site ↗
              </a>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              {product.status !== 'ACTIVE' && (
                <Button onClick={() => setStatus('ACTIVE')}>Publicar</Button>
              )}
              {product.status === 'ACTIVE' && (
                <Button variant="ghost" onClick={() => setStatus('DRAFT')}>
                  Voltar para rascunho
                </Button>
              )}
              {product.status !== 'ARCHIVED' && (
                <Button variant="danger" onClick={() => setStatus('ARCHIVED')}>
                  Arquivar
                </Button>
              )}
            </div>
          </div>
          {statusError && (
            <div className="mt-4">
              <Alert>{statusError}</Alert>
            </div>
          )}
        </Panel>

        <Panel title="Fotos">
          <ProductImages productId={product.id} images={product.images} onChange={reload} />
        </Panel>

        <Panel title="Lojas, links e preços">
          <ProductLinks productId={product.id} links={product.links} onChange={reload} />
        </Panel>

        <Panel title="Conteúdo">
          <ProductForm product={product} onSaved={() => void reload()} />
        </Panel>
      </div>
    </>
  );
}
