/**
 * Peças de interface do painel. Mesma marca do site, tom mais calmo: superfícies brancas,
 * tipografia de interface, cor só para estado e ação.
 */
import { buttonClass } from '@/components/ui/button';

const inputCls =
  'w-full rounded-s border-[1.5px] border-linha bg-white px-3 py-2.5 text-[15px] outline-none focus:border-midnight aria-[invalid=true]:border-brasa';

type FieldProps = {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  className?: string;
};

function FieldShell({
  label,
  name,
  error,
  hint,
  className = '',
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label mb-1.5 block text-nevoa">
        {label}
      </label>
      {children}
      {error?.length ? (
        <p id={`${name}-erro`} className="mt-1 text-[13px] text-[#B5321A]">
          {error[0]}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[13px] text-nevoa">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={!!error?.length}
        aria-describedby={error?.length ? `${name}-erro` : undefined}
        className={inputCls}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={!!error?.length}
        className={`${inputCls} min-h-28`}
        {...rest}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  className,
  children,
  ...rest
}: FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} className={className}>
      <select id={name} name={name} aria-invalid={!!error?.length} className={inputCls} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-medium">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-electric"
      />
      {label}
    </label>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v =
    variant === 'danger'
      ? 'inline-flex h-10 items-center rounded-m border-[1.5px] border-brasa px-4 text-sm font-bold text-[#B5321A] hover:bg-brasa hover:text-midnight'
      : variant === 'ghost'
        ? buttonClass.ghost
        : variant === 'secondary'
          ? `${buttonClass.secondary} h-10 px-4 text-sm`
          : `${buttonClass.primary} h-10 px-5 text-sm`;
  return (
    <button
      type="button"
      className={`${v} disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
}

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'ok' | 'info';
  children: React.ReactNode;
}) {
  const c =
    tone === 'error' ? 'bg-[#FFE7E1] text-[#7A1E0C]' : tone === 'ok' ? 'bg-lime-soft' : 'bg-lilas';
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-m px-4 py-3 text-sm ${c}`}>
      {children}
    </p>
  );
}

export function Panel({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-l border border-linha bg-white p-5 md:p-6">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-display text-xl font-bold [font-stretch:88%]">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="label text-electric-deep">{eyebrow}</p>}
        <h1 className="display mt-2 text-4xl md:text-5xl">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export const Loading = () => (
  <p className="label animate-pulse text-nevoa" role="status">
    Carregando…
  </p>
);

/** Lê texto opcional de um FormData: vazio vira null (limpa o campo na API). */
export const optionalText = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? '').trim();
  return v === '' ? null : v;
};
