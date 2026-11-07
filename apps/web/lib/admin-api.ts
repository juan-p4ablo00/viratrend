'use client';

/**
 * Cliente do painel: roda no navegador e fala direto com a API usando o cookie de sessão
 * (HttpOnly — o JavaScript nunca o lê). A API valida sessão, papel e origem em cada chamada;
 * nada aqui é "segurança", só experiência.
 */
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
  /** Erros de campo vindos da validação Zod da API. */
  get fieldErrors(): Record<string, string[]> {
    return this.code === 'VALIDATION' && this.details && typeof this.details === 'object'
      ? (this.details as Record<string, string[]>)
      : {};
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function adminFetch<T>(
  path: string,
  method: Method = 'GET',
  body?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${PUBLIC_API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AdminApiError(0, 'NETWORK', 'Sem conexão com a API. Verifique se ela está no ar.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AdminApiError(
      res.status,
      data?.error?.code ?? 'HTTP',
      data?.error?.message ?? `Erro ${res.status}`,
      data?.error?.details,
    );
  }
  return data as T;
}

/** Carrega um recurso do painel. Sessão expirada (401) leva ao login. */
export function useAdminData<T>(path: string | null) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AdminApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await adminFetch<T>(path));
      setError(null);
    } catch (err) {
      const e = err as AdminApiError;
      if (e.status === 401) router.replace('/admin/login');
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [path, router]);

  useEffect(() => {
    // Carregamento inicial do recurso; setState acontece depois do await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
