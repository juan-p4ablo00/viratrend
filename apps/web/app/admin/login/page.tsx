'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginSchema } from '@viratrend/shared';
import { Logo } from '@/components/brand/logo';
import { Alert, Button, Input } from '@/components/admin/ui';
import { adminFetch, AdminApiError } from '@/lib/admin-api';

/** Login do painel. Não existe cadastro: usuários são criados pelo comando admin:create. */
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: fd.get('email'), password: fd.get('password') });
    if (!parsed.success) return setError('Informe e-mail e senha.');
    setBusy(true);
    setError(null);
    try {
      await adminFetch('/auth/login', 'POST', parsed.data);
      router.replace('/admin');
    } catch (err) {
      setError((err as AdminApiError).message);
      setBusy(false);
    }
  }

  return (
    <main id="conteudo" className="grid min-h-dvh place-items-center bg-midnight px-4">
      <div className="quina w-full max-w-sm rounded-l bg-off p-8 [--q:32px]">
        <Logo className="h-7 w-auto" />
        <h1 className="display mt-8 text-4xl">Painel</h1>
        <p className="mt-2 text-sm text-nevoa">Acesso restrito à equipe da ViraTrend.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
