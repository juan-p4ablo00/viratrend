import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { siteConfig } from '@/lib/site';

const institutional = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/como-funcionam-os-links', label: 'Como funcionam os links' },
  { href: '/contato', label: 'Contato' },
  { href: '/privacidade', label: 'Privacidade' },
  { href: '/termos', label: 'Termos de uso' },
];

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-off">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:px-8">
        <div className="space-y-4">
          <Logo tone="dark" className="h-7 w-auto" />
          <p className="max-w-xl text-sm text-nevoa-claro">{siteConfig.affiliateDisclosure}</p>
        </div>
        <nav aria-label="Institucional" className="grid gap-2 text-sm">
          {institutional.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-lime">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
