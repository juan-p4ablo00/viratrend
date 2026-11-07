import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';
import type { ApiError } from '@viratrend/shared';
import { HttpError } from '../utils/http-error.js';

export const notFound: RequestHandler = (_req, res) => {
  res
    .status(404)
    .json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada' } } satisfies ApiError);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    } satisfies ApiError);
    return;
  }
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION',
        message: 'Dados inválidos',
        details: z.flattenError(err).fieldErrors,
      },
    } satisfies ApiError);
    return;
  }
  // JSON malformado no body
  if (err instanceof SyntaxError && 'body' in err) {
    res
      .status(400)
      .json({ error: { code: 'BAD_JSON', message: 'JSON inválido' } } satisfies ApiError);
    return;
  }
  // Erros conhecidos do Prisma viram respostas claras (sem expor SQL nem nomes internos).
  const prismaCode =
    (err as { name?: string; code?: string })?.name === 'PrismaClientKnownRequestError'
      ? (err as { code: string }).code
      : undefined;
  if (prismaCode === 'P2002') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Já existe um registro com esse valor (slug, e-mail ou loja duplicada)',
      },
    } satisfies ApiError);
    return;
  }
  if (prismaCode === 'P2003') {
    res.status(409).json({
      error: { code: 'RELATION', message: 'Registro relacionado inexistente ou em uso' },
    } satisfies ApiError);
    return;
  }
  if (prismaCode === 'P2025') {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Registro não encontrado' },
    } satisfies ApiError);
    return;
  }
  // Loga método, rota e stack — nunca body, cookies ou headers (podem conter senha/sessão).
  console.error(`[${req.method} ${req.path}]`, err instanceof Error ? err.stack : err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Erro interno' } } satisfies ApiError);
};
