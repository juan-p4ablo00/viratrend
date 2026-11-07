'use client';

import { useRouter } from 'next/navigation';
import { PageTitle, Panel } from '@/components/admin/ui';
import { ProductForm } from '@/features/admin/product-form';

export default function NewProductPage() {
  const router = useRouter();
  return (
    <>
      <PageTitle eyebrow="Produtos" title="Novo produto" />
      <Panel>
        <p className="mb-5 text-sm text-nevoa">
          O produto nasce como rascunho. Depois de salvar você adiciona fotos, lojas e preços — e
          publica quando estiver completo.
        </p>
        <ProductForm onSaved={(p) => router.replace(`/admin/produtos/${p.id}`)} />
      </Panel>
    </>
  );
}
