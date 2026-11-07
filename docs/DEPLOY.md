# ViraTrend — guia de deploy

> Nada foi publicado, contratado ou alterado em DNS. Este guia descreve o que fazer **quando** você
> autorizar o deploy. Execute na ordem: banco → API → site → verificação.

## 0. Antes de tudo: confirmar a hospedagem (docs/ARCHITECTURE.md §7)

No painel da Hostinger, confirme e anote:

- [ ] Plano com **aplicações Node.js** (Business ou Cloud).
- [ ] Versão do Node disponível **≥ 20.19** (preferir 22 ou 24 — o projeto é testado no 24).
- [ ] `SHOW VARIABLES LIKE 'max_user_connections';` no MySQL → ajuste `DATABASE_POOL_SIZE` para no máximo metade desse valor.
- [ ] O processo Node reinicia sozinho após falha (teste: reiniciar pelo painel e chamar `/health`).
- [ ] Subdomínio `api.<domínio>` com HTTPS.
- [ ] Se a instalação roda com `NODE_ENV=production`, as `devDependencies` (Prisma CLI, TypeScript) não são instaladas — use `npm ci --include=dev` no build (abaixo).

## 1. Banco (MySQL da Hostinger)

1. Crie o banco e um usuário **exclusivo** da ViraTrend com permissões só nesse banco.
2. A API roda no mesmo servidor: use host `127.0.0.1` (não o `srvNNNN.hstgr.io`).
3. As migrations rodam no build da API (passo 2). Para rodar de fora, libere conexão remota temporariamente e use `npm run db:deploy` com a `DATABASE_URL` remota.
4. Seed de categorias e lojas (uma vez): `npm run db:seed`. **Nunca** use `-- --demo` em produção.

## 2. API (Hostinger — aplicação Node.js)

Repositório: este monorepo. Raiz do app = raiz do repositório.

| Campo do painel  | Valor                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Comando de build | `npm ci --include=dev && npm run build:api && npm run db:deploy` |
| Comando de start | `npm run start:api` (equivale a `node apps/api/dist/server.js`)  |
| Node             | 22 ou 24                                                         |

Variáveis de ambiente (painel → Node.js → variáveis):

| Variável             | Produção                                                  |
| -------------------- | --------------------------------------------------------- |
| `NODE_ENV`           | `production`                                              |
| `PORT`               | a porta que a Hostinger indicar (ou omitir se ela injeta) |
| `DATABASE_URL`       | `mysql://USUARIO:SENHA@127.0.0.1:3306/BANCO`              |
| `DATABASE_POOL_SIZE` | ver passo 0 (padrão 5)                                    |
| `CORS_ORIGINS`       | `https://viratrend.com.br,https://www.viratrend.com.br`   |
| `PUBLIC_API_URL`     | `https://api.viratrend.com.br`                            |
| `TRUST_PROXY`        | `1`                                                       |
| `SESSION_TTL_HOURS`  | `12`                                                      |

Primeiro administrador (terminal SSH da Hostinger, na raiz do projeto):

```bash
npm run admin:create -w @viratrend/api -- --email voce@dominio.com --name "Seu Nome"
```

A senha é pedida no terminal (mínimo 12 caracteres). Não existe cadastro pela web.

Verificação: `https://api.viratrend.com.br/health` → `{"status":"ok","db":"ok"}`.

## 3. Site (Vercel)

| Configuração    | Valor                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Root Directory  | `apps/web`                                                                                                            |
| Framework       | Next.js (detectado)                                                                                                   |
| Install / Build | padrão da Vercel (`npm install` na raiz do monorepo; `npm run build` roda o `prebuild` que compila `packages/shared`) |
| Node            | 22 ou 24                                                                                                              |

Variáveis (Production; repita em Preview apontando para uma API de teste, se houver):

| Variável                                                                           | Valor                                                      |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                             | `https://viratrend.com.br`                                 |
| `API_URL`                                                                          | `https://api.viratrend.com.br` (lido só no servidor)       |
| `NEXT_PUBLIC_API_URL`                                                              | `https://api.viratrend.com.br` (painel no navegador + CSP) |
| `IMAGE_HOSTS`                                                                      | host do storage de imagens, quando existir                 |
| `NEXT_PUBLIC_TIKTOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` | quando os perfis/canais existirem                          |

Previews da Vercel recebem `robots.txt` bloqueando tudo (`VERCEL_ENV != production`).

## 4. Domínio (fora do escopo desta entrega — exige sua ação)

- `viratrend.com.br` (e `www`) → Vercel.
- `api.viratrend.com.br` → aplicação Node da Hostinger.
- Site e API **precisam** do mesmo domínio-raiz: o cookie de sessão do painel usa `SameSite=Lax`.

## 5. Verificação pós-deploy

- [ ] `/health` da API ok.
- [ ] Home carrega com categorias reais; nenhum produto `[DEMO]` no banco de produção.
- [ ] `/admin` redireciona para o login; login funciona; logout invalida a sessão.
- [ ] Cadastrar um produto real → publicar → aparece em até 60 s no site (ISR).
- [ ] Botão "Ver na loja" passa por `/go/:id` e chega ao link de afiliado; o clique aparece no dashboard.
- [ ] `/sitemap.xml` lista produtos; `/robots.txt` aponta o sitemap; `/opengraph-image` responde PNG.
- [ ] Rich Results Test (Google) na página de um produto com preço conferido há menos de 24 h.
- [ ] Cabeçalhos: `Content-Security-Policy` no site; `Strict-Transport-Security` nos dois.

## 6. Atualizações e rollback

- **Atualizar API:** novo push → a Hostinger refaz o build (migrations incluídas). Migrations são só aditivas por padrão; uma migration destrutiva exige backup manual antes.
- **Rollback do site:** Vercel → Deployments → "Promote" de um deploy anterior.
- **Backup do MySQL:** ativar o backup diário do painel antes do lançamento.

## 7. Migração futura para VPS

Nada no código depende da Hostinger. Em uma VPS: Node 24 + MySQL 8 + Nginx (TLS, proxy para a porta da API) + um gerenciador de processo (systemd ou pm2) rodando `npm run start:api`; mesmas variáveis de ambiente; `npm run db:deploy` a cada versão; `TRUST_PROXY=1`.
