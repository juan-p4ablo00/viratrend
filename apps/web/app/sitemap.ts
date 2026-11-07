import type { MetadataRoute } from 'next';
import { getSitemapData } from '@/lib/api';
import { siteConfig } from '@/lib/site';

// Regenera a cada hora: produtos novos entram sem novo deploy.
export const revalidate = 3600;

const staticPages = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/em-alta', priority: 0.9, changeFrequency: 'daily' },
  { path: '/ofertas', priority: 0.9, changeFrequency: 'daily' },
  { path: '/categorias', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/sobre', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/como-funcionam-os-links', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/contato', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacidade', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/termos', priority: 0.1, changeFrequency: 'yearly' },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getSitemapData();
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  return [
    ...staticPages.map((p) => ({
      url: url(p.path),
      priority: p.priority,
      changeFrequency: p.changeFrequency,
    })),
    ...categories.map((c) => ({
      url: url(`/categoria/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: url(`/produto/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
