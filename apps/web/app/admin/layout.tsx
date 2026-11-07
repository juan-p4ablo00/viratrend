import type { Metadata } from 'next';

// O painel nunca deve aparecer em buscadores.
export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 bg-off">{children}</div>;
}
