import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

/**
 * Painel e busca fora do índice (busca gera páginas infinitas e duplicadas).
 * Fora de produção, bloqueia tudo — evita indexar previews da Vercel.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : true;
  if (!isProduction) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/busca'] },
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
