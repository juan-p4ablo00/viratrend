import Link from 'next/link';
import { Search } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { mainNav } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-off/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:px-8">
        <Link href="/" aria-label="ViraTrend — início" className="shrink-0">
          <Logo className="h-6 w-auto" />
        </Link>
        <nav aria-label="Principal" className="hidden gap-6 text-sm font-semibold md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:shadow-[inset_0_-3px_0_var(--color-lime)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Mobile: só o ícone (a busca completa vive em /busca); a partir de sm, o campo inline. */}
        <Link
          href="/busca"
          aria-label="Buscar produtos"
          className="ml-auto grid size-10 place-items-center rounded-m border-[1.5px] border-midnight bg-white sm:hidden"
        >
          <Search aria-hidden className="size-4" strokeWidth={2.4} />
        </Link>
        <form action="/busca" role="search" className="ml-auto hidden items-center sm:flex">
          <label htmlFor="q-header" className="sr-only">
            Buscar produtos
          </label>
          <div className="flex h-10 items-center gap-2 rounded-m border-[1.5px] border-midnight bg-white px-3">
            <Search aria-hidden className="size-4" strokeWidth={2.4} />
            <input
              id="q-header"
              name="q"
              type="search"
              placeholder="Buscar achados"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-nevoa"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
