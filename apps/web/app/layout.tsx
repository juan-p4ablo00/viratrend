import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from 'next/font/google';
import { siteConfig } from '@/lib/site';
import '@/styles/globals.css';

// Fontes da identidade (SIL OFL), servidas pelo próprio site via next/font — sem request ao Google no navegador.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  axes: ['opsz', 'wdth'],
});
const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  axes: ['wdth'],
});
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: { type: 'website', locale: 'pt_BR', siteName: siteConfig.name },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#101426' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${instrument.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-m focus:bg-lime focus:px-4 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
