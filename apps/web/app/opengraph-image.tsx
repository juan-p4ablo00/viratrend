import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

/**
 * Imagem padrão de compartilhamento (WhatsApp, Instagram, X…) gerada a partir dos tokens
 * da marca — sem arquivo binário a manter. Produtos com foto usam a própria foto.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#101426',
        padding: 72,
        position: 'relative',
      }}
    >
      {/* Símbolo Quina (mesma geometria do logo) */}
      <svg width="132" height="132" viewBox="0 -8 108 108">
        <path
          fill="#C8F36A"
          d="M0 16C0 7.2 7.2 0 16 0H56L100 44V84C100 92.8 92.8 100 84 100H16C7.2 100 0 92.8 0 84Z"
        />
        <path fill="#765BFF" d="M64 -8H108V36Z" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', color: '#F5F4F0' }}>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
          Produtos que viralizam.
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.05,
            color: '#C8F36A',
          }}
        >
          Achados que valem a pena.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: '#8B8FA3' }}>
          viratrend · curadoria com preço conferido
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 180,
          height: 180,
          background: '#765BFF',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }}
      />
    </div>,
    size,
  );
}
