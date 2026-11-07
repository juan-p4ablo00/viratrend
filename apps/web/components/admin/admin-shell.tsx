'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { LayoutDashboard, LogOut, Package, Store, Tags } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { adminFetch, AdminApiError } from '@/lib/admin-api';
import type { AdminUser } from '@/lib/admin-types';
import { Loading } from './ui';

const UserContext = createContext<AdminUser | null>(null);
/** Usuário logado (só dentro do painel). Usado para esconder ações que a API recusaria pelo papel. */
export const useAdminUser = () => useContext(UserContext)!;

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/lojas', label: 'Lojas', icon: Store },
];

/**
 * Moldura do painel: confere a sessão em /auth/me antes de mostrar qualquer tela.
 * A proteção real é da API (todas as rotas /admin exigem sessão); isto só evita mostrar
 * uma tela vazia para quem não está logado.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ user: AdminUser }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch((e: AdminApiError) => {
        if (e.status === 401) router.replace('/admin/login');
        else setFailure(e.message);
      });
  }, [router]);

  async function logout() {
    await adminFetch('/auth/logout', 'POST').catch(() => undefined);
    router.replace('/admin/login');
  }

  if (failure) return <p className="p-8">{failure}</p>;
  if (!user)
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loading />
      </div>
    );

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
        <aside className="bg-midnight text-off md:sticky md:top-0 md:h-dvh">
          <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
            <Link href="/admin" aria-label="Painel ViraTrend">
              <Logo tone="dark" className="h-6 w-auto" />
            </Link>
            <p className="label mt-0 text-[10px] text-lime md:mt-2">Painel</p>
          </div>
          <nav
            aria-label="Painel"
            className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3"
          >
            {nav.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? path === href : path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-m px-3 py-2.5 text-sm font-semibold ${active ? 'bg-lime text-midnight' : 'text-nevoa-claro hover:bg-noite hover:text-off'}`}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden border-t border-noite px-5 py-4 md:absolute md:inset-x-0 md:bottom-0 md:block">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="label text-[10px] text-nevoa-claro">
              {user.role === 'ADMIN' ? 'Administrador' : 'Editor'}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex items-center gap-2 text-sm text-nevoa-claro hover:text-lime"
            >
              <LogOut aria-hidden className="size-4" /> Sair
            </button>
          </div>
        </aside>
        <main id="conteudo" className="px-4 py-8 md:px-10 md:py-10">
          {children}
          <button type="button" onClick={logout} className="label mt-12 text-nevoa md:hidden">
            Sair do painel
          </button>
        </main>
      </div>
    </UserContext.Provider>
  );
}
