import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').origin;

/**
 * CSP estático. O modelo com nonce do Next exigiria renderizar toda página sob demanda e
 * perderíamos o cache estático/ISR; por isso scripts inline do próprio Next ficam liberados
 * ('unsafe-inline') e o resto é fechado: só a API como destino de fetch, nada de frames,
 * plugins ou formulários para fora. Revisitar se surgir conteúdo de terceiros na página.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}${isDev ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Hosts de imagem otimizados (IMAGE_HOSTS, separados por vírgula) — o storage próprio
    // quando for definido. Imagens de outros hosts aparecem sem otimização (product-image.tsx).
    remotePatterns: (process.env.IMAGE_HOSTS ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)
      .map((hostname) => ({ protocol: 'https' as const, hostname })),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
