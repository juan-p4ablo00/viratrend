/** Selo giratório de assinatura (brandbook §07). Nunca afirma algo que não fizemos. */
export function Selo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      className={`animate-[spin_24s_linear_infinite] ${className}`}
    >
      <defs>
        <path id="selo-circ" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#765BFF" />
      <text
        fontFamily="var(--font-geist-mono)"
        fontWeight="700"
        fontSize="13.2"
        letterSpacing="3.1"
        fill="#F5F4F0"
      >
        <textPath href="#selo-circ" textLength="462">
          ACHADOS QUE VALEM A PENA • VIRATREND •
        </textPath>
      </text>
      <g transform="translate(70 70) scale(0.5556) translate(0 8)">
        <path
          fill="#C8F36A"
          d="M0 16C0 7.2 7.2 0 16 0H56L100 44V84C100 92.8 92.8 100 84 100H16C7.2 100 0 92.8 0 84Z"
        />
        <path fill="#101426" d="M64 -8H108V36Z" />
      </g>
    </svg>
  );
}
