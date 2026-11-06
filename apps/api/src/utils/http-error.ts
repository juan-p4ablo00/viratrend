/** Erro esperado (4xx) com código estável para o frontend. Qualquer outro erro vira 500 genérico. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}
