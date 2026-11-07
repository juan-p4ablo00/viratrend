/**
 * Estilos de botão do brandbook §11 como classes (servem para <a>, <Link> e <button>).
 * Primário = lime + sombra dura (sobe no hover, afunda no clique). Loja = midnight + "↗".
 */
const base =
  'inline-flex shrink-0 items-center whitespace-nowrap justify-center gap-2 rounded-m font-sans font-bold transition-[transform,box-shadow,background-color] duration-150 ease-salto';

export const buttonClass = {
  primary: `${base} h-12 px-6 text-[15px] bg-lime text-midnight shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-midnight)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none`,
  // Electric Deep: branco sobre Electric (#765BFF) dá 4,05:1, abaixo do AA para texto pequeno.
  secondary: `${base} h-12 px-6 text-[15px] bg-electric-deep text-white hover:bg-midnight`,
  ghost: `${base} h-10 px-4 text-sm border-[1.5px] border-current`,
  store: `${base} h-11 px-5 text-sm bg-midnight text-off hover:bg-electric-deep`,
  storeSm: `${base} h-9 px-3 text-[13px] rounded-s bg-midnight text-off hover:bg-electric-deep`,
};

/** Atributos obrigatórios em todo link de afiliado (Google: rel="sponsored"). */
export const affiliateLinkProps = {
  target: '_blank',
  rel: 'sponsored nofollow noopener',
} as const;
