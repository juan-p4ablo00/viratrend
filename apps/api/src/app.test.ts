/**
 * Teste de integração da API contra um MySQL real (banco descartável viratrend_test).
 *
 *   npm test -w @viratrend/api
 *
 * TEST_DATABASE_SERVER: servidor MySQL de testes (padrão: root sem senha do Laragon local).
 * Cada execução cria um banco novo (viratrend_test_<timestamp>), aplica as migrations com
 * `prisma migrate deploy` e remove SÓ esse banco ao terminar. Nenhum banco existente é tocado.
 */
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import mariadb from 'mariadb';

const SITE = 'http://localhost:3000';
const SERVER = process.env.TEST_DATABASE_SERVER ?? 'mysql://root@127.0.0.1:3306';
const DB_NAME = `viratrend_test_${Date.now()}`;
const DB = `${SERVER}/${DB_NAME}`;

Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: DB,
  CORS_ORIGINS: SITE,
  PUBLIC_API_URL: 'http://localhost:4000',
});

/** SQL avulso no servidor (criar/remover o banco de teste), fora de qualquer banco da aplicação. */
async function sql(statement: string) {
  const u = new URL(SERVER);
  const conn = await mariadb.createConnection({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  });
  try {
    await conn.query(statement);
  } finally {
    await conn.end();
  }
}

let server: Server;
let base = '';
let cookie = '';
let disconnect: () => Promise<void>;

async function call(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const res = await fetch(base + path, {
    method,
    redirect: 'manual',
    headers: {
      Origin: SITE,
      ...(cookie && { Cookie: cookie }),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  // Teste lê campos livremente; o contrato tipado vale para o código de produção.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = res.headers.get('content-type')?.includes('json') ? JSON.parse(text) : null;
  return { status: res.status, headers: res.headers, json };
}

before(async () => {
  await sql(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  execSync('npx prisma migrate deploy', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: DB },
  });
  const { createApp } = await import('./app.js');
  const { prisma } = await import('./config/db.js');
  const { authService } = await import('./services/auth.service.js');
  disconnect = () => prisma.$disconnect();
  await prisma.user.create({
    data: {
      email: 'admin@teste.local',
      name: 'Admin Teste',
      role: 'ADMIN',
      passwordHash: await authService.hashPassword('senha-de-teste-123'),
    },
  });
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  try {
    server?.close();
    await disconnect?.();
  } finally {
    await sql(`DROP DATABASE IF EXISTS \`${DB_NAME}\``); // só o banco criado por esta execução
  }
});

test('saúde e proteção do painel', async () => {
  assert.equal((await call('GET', '/health')).json.db, 'ok');
  assert.equal((await call('GET', '/admin/dashboard')).status, 401);
  assert.equal((await call('GET', '/auth/me')).status, 401);
});

test('login', async () => {
  const wrong = await call('POST', '/auth/login', {
    email: 'admin@teste.local',
    password: 'errada',
  });
  assert.equal(wrong.status, 401);
  const unknown = await call('POST', '/auth/login', { email: 'nao@existe.local', password: 'x' });
  assert.equal(
    unknown.json.error.code,
    'INVALID_CREDENTIALS',
    'mesma resposta para e-mail inexistente',
  );
  const evil = await call(
    'POST',
    '/auth/login',
    { email: 'admin@teste.local', password: 'senha-de-teste-123' },
    { Origin: 'https://evil.example' },
  );
  assert.equal(evil.status, 403);

  const ok = await call('POST', '/auth/login', {
    email: 'ADMIN@teste.local',
    password: 'senha-de-teste-123',
  });
  assert.equal(ok.status, 200);
  const setCookie = ok.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /vt_session=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  cookie = setCookie.split(';')[0]!;
  assert.equal((await call('GET', '/auth/me')).json.user.role, 'ADMIN');
});

test('fluxo completo: cadastrar → publicar → preço → oferta → clique', async () => {
  // mutação sem Origin é recusada mesmo com sessão
  const noOrigin = await fetch(`${base}/admin/categories`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'X' }),
  });
  assert.equal(noOrigin.status, 403);

  const cat = await call('POST', '/admin/categories', { name: 'Tecnologia Teste' });
  assert.equal(cat.status, 201);
  assert.equal(cat.json.slug, 'tecnologia-teste');
  assert.equal((await call('POST', '/admin/categories', { name: 'Tecnologia Teste' })).status, 409);

  const amazon = await call('POST', '/admin/stores', {
    name: 'Amazon',
    websiteUrl: 'https://www.amazon.com.br',
  });
  const ml = await call('POST', '/admin/stores', {
    name: 'Mercado Livre',
    websiteUrl: 'https://www.mercadolivre.com.br',
  });
  assert.equal(amazon.status, 201);

  const prod = await call('POST', '/admin/products', {
    name: 'Fone Ágil',
    description: 'Descrição',
    keywords: 'bluetooth sem fio',
    categoryId: cat.json.id,
    isFeatured: true,
  });
  assert.equal(prod.status, 201);
  assert.equal(prod.json.status, 'DRAFT');
  const pid = prod.json.id;

  const early = await call('PATCH', `/admin/products/${pid}`, { status: 'ACTIVE' });
  assert.equal(early.status, 422);
  assert.deepEqual(early.json.error.details.missing.length, 2);

  assert.equal(
    (
      await call('POST', `/admin/products/${pid}/images`, {
        url: 'http://inseguro.example/a.jpg',
        alt: 'Fone',
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call('POST', `/admin/products/${pid}/images`, {
        url: 'https://cdn.example/a.jpg',
        alt: 'Fone',
      })
    ).status,
    201,
  );

  const link = await call('POST', `/admin/products/${pid}/links`, {
    storeId: amazon.json.id,
    url: 'https://amzn.to/teste',
  });
  assert.equal(link.json.isPrimary, true, 'primeiro link vira principal');
  const lid = link.json.id;

  assert.equal(
    (await call('PATCH', `/admin/links/${lid}`, { offerStatus: 'VERIFIED' })).status,
    422,
    'oferta exige preço',
  );
  await call('POST', `/admin/links/${lid}/prices`, { priceCents: 11990, source: 'página da loja' });
  await call('POST', `/admin/links/${lid}/prices`, { priceCents: 8990 });
  assert.equal((await call('GET', `/admin/links/${lid}/prices`)).json.items.length, 2);
  assert.equal(
    (await call('PATCH', `/admin/links/${lid}`, { offerStatus: 'VERIFIED' })).status,
    200,
  );

  assert.equal((await call('PATCH', `/admin/products/${pid}`, { status: 'ACTIVE' })).status, 200);

  // público
  const detail = await call('GET', '/public/products/fone-agil');
  assert.equal(detail.status, 200);
  const offer = detail.json.primaryOffer;
  assert.equal(offer.priceCents, 8990);
  assert.equal(offer.previousPriceCents, 11990, 'preço anterior vem do histórico');
  assert.ok(offer.offerVerifiedAt);
  assert.match(offer.goUrl, new RegExp(`/go/${lid}$`));
  assert.equal(
    JSON.stringify(detail.json).includes('amzn.to'),
    false,
    'URL de afiliado não vaza no JSON',
  );

  for (const q of [
    'section=featured',
    'section=offers',
    'q=bluetooth',
    'q=tecnologia',
    'category=tecnologia-teste',
  ]) {
    const r = await call('GET', `/public/products?${q}`);
    assert.equal(r.json.total, 1, q);
  }
  assert.equal((await call('GET', '/public/products?section=trending')).json.total, 0);

  // clique
  const go = await call('GET', `/go/${lid}?utm_source=tiktok`, undefined, {
    Referer: 'https://www.tiktok.com/@viratrend',
  });
  assert.equal(go.status, 302);
  assert.equal(go.headers.get('location'), 'https://amzn.to/teste');
  await new Promise((r) => setTimeout(r, 200)); // o registro é assíncrono
  const dash = await call('GET', '/admin/dashboard');
  assert.equal(dash.json.clicks.total, 1);
  assert.equal(dash.json.topProducts30d[0].productId, pid);
  assert.equal(
    (await call('GET', '/public/products?section=popular')).json.items[0].slug,
    'fone-agil',
  );

  // excesso de cliques do mesmo IP: continua redirecionando, mas para de contar após 20/min
  const burst = await Promise.all(Array.from({ length: 25 }, () => call('GET', `/go/${lid}`)));
  assert.ok(burst.every((r) => r.status === 302));
  await new Promise((r) => setTimeout(r, 300));
  assert.equal((await call('GET', '/admin/dashboard')).json.clicks.total, 20);

  // segundo link marcado como principal tira o principal do primeiro
  const link2 = await call('POST', `/admin/products/${pid}/links`, {
    storeId: ml.json.id,
    url: 'https://meli.la/teste',
    isPrimary: true,
  });
  assert.equal(link2.json.isPrimary, true);
  const admin = await call('GET', `/admin/products/${pid}`);
  assert.equal(admin.json.links.filter((l: { isPrimary: boolean }) => l.isPrimary).length, 1);
  assert.equal(
    (
      await call('POST', `/admin/products/${pid}/links`, {
        storeId: ml.json.id,
        url: 'https://meli.la/x',
      })
    ).status,
    409,
  );

  // categoria com produto não pode ser excluída
  assert.equal((await call('DELETE', `/admin/categories/${cat.json.id}`)).status, 409);

  // arquivar: some do site; /go volta para o site em vez da loja
  assert.equal((await call('DELETE', `/admin/products/${pid}`)).status, 204);
  assert.equal((await call('GET', '/public/products/fone-agil')).status, 404);
  assert.equal((await call('GET', `/go/${lid}`)).headers.get('location'), SITE);
});

test('logout encerra a sessão', async () => {
  assert.equal((await call('POST', '/auth/logout')).status, 204);
  assert.equal((await call('GET', '/admin/dashboard')).status, 401);
});

test('rate limit do login', async () => {
  cookie = '';
  const statuses = [];
  for (let i = 0; i < 6; i++) {
    statuses.push(
      (await call('POST', '/auth/login', { email: 'alvo@teste.local', password: 'x' })).status,
    );
  }
  assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429]);
});
