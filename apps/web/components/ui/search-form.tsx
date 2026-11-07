import { Search } from 'lucide-react';
import { buttonClass } from './button';

/**
 * Busca protagonista (brandbook §11): borda 2px + sombra dura. Formulário GET puro —
 * funciona sem JavaScript e gera URL compartilhável (/busca?q=…).
 */
export function SearchForm({
  defaultValue = '',
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <form
      action="/busca"
      role="search"
      className="flex h-14 items-center gap-2.5 rounded-m border-2 border-midnight bg-white pr-2 pl-4 shadow-hard"
    >
      <Search aria-hidden className="size-5 shrink-0" strokeWidth={2.4} />
      <label htmlFor="q-main" className="sr-only">
        Buscar produtos
      </label>
      <input
        id="q-main"
        name="q"
        type="search"
        minLength={2}
        maxLength={80}
        required
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="O que está em alta, você encontra aqui"
        className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-nevoa"
      />
      <button type="submit" className={`${buttonClass.secondary} h-10 px-4 text-sm`}>
        Buscar
      </button>
    </form>
  );
}
