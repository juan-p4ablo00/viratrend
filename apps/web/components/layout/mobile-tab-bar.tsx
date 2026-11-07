'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, House, LayoutGrid, Search, Tag } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Início', icon: House },
  { href: '/em-alta', label: 'Em alta', icon: Flame },
  { href: '/busca', label: 'Busca', icon: Search },
  { href: '/ofertas', label: 'Ofertas', icon: Tag },
  { href: '/categorias', label: 'Categorias', icon: LayoutGrid },
] as const;

/** Navegação inferior no celular (brandbook §11): item ativo ganha o salto lime. */
export function MobileTabBar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === '/'
      ? path === '/'
      : path.startsWith(href) || (href === '/categorias' && path.startsWith('/categoria/'));

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-midnight px-1.5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`relative grid justify-items-center gap-1 py-1 text-[10px] font-semibold ${active ? 'text-lime' : 'text-nevoa-claro'}`}
          >
            {active && (
              <i
                aria-hidden
                className="absolute -top-2 size-4 bg-lime [clip-path:polygon(0_0,100%_0,100%_100%)]"
              />
            )}
            <Icon aria-hidden className="size-5" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
