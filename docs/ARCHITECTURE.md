# ViraTrend — Arquitetura, modelo de dados e plano

Fases 1 (auditoria), 2 (fundação), 3 (banco e API), 4 (interface pública), 5 (painel) e 6 (finalização). Deploy: [DEPLOY.md](DEPLOY.md). Atualizado em 06/11/2026. Referência dos endpoints: §9.

---

## 1. Auditoria

### 1.1 Identidade visual

Fonte única: [`docs/brand/ViraTrend-Identidade.html`](brand/ViraTrend-Identidade.html) (cópia do arquivo produzido na etapa de branding; o original continua no worktree `jpi-tech/.claude/worktrees/viratrend-branding-design-4c2ef5/ViraTrend/`).

| Item                                                    | Onde está no brandbook        | Como foi aproveitado na plataforma                                             |
| ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| Símbolo "Quina" + wordmark                              | §04, sprite `#q` `#w`         | `apps/web/components/brand/logo.tsx` — mesma geometria, sem redesenho          |
| Assinatura horizontal/vertical, mono                    | §04, §14 (exportação SVG/PNG) | Horizontal no header/footer; demais versões exportáveis pelo próprio brandbook |
| Paleta (10 cores + contraste)                           | §05                           | `apps/web/styles/globals.css` `@theme` (mesmos HEX)                            |
| Tipografia                                              | §06                           | `next/font`: Bricolage Grotesque, Instrument Sans, Geist Mono (SIL OFL)        |
| Elementos (Quina, Fita, Sinal, Selo, Etiqueta de preço) | §07                           | Utilitário `quina` pronto; demais viram componentes na Fase 4                  |
| Design system (botões, busca, badges, cards, nav)       | §11                           | Referência visual dos componentes da Fase 4                                    |
| Direção de páginas + mockups desktop/mobile             | §12                           | Referência da Fase 4                                                           |
| Motion (curvas Salto/Pulo, durações)                    | §13                           | Tokens `--ease-salto` e `--ease-pulo`; `prefers-reduced-motion` global         |
| Favicon                                                 | §04 (avatar)                  | `apps/web/app/icon.svg`                                                        |

**Faltas registradas e proposta:**

1. **Categorias Games e Fitness** não existem no brandbook (ele previa Casa, Tech, Beleza, Moda, Utilidades). Proposta: Games = Noite + Electric; Fitness = Lime Soft + Midnight — mantém a regra "cada categoria tem cor-base fixa". Validar antes da Fase 4.
2. **Imagem Open Graph** (1200×630) não foi produzida. Proposta: gerar com `next/og` a partir dos tokens (Fase 6) — sem arquivo binário a manter.
3. **Fotos de produto reais**: o brandbook usa ilustrações placeholder. A plataforma nunca exibe placeholders como se fossem produtos; produto sem imagem mostra um bloco de cor da categoria com a Quina.
4. **Logos em arquivos soltos**: o brandbook exporta SVG/PNG pela seção 14; o site usa o componente React (sem requisição extra).

### 1.2 Repositório e ambiente

| Verificação                          | Resultado                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repositório onde estava a identidade | `jpi-tech` — site da JPI Tech (Next 16). O `tsconfig` dele inclui `**/*.ts`: código da ViraTrend ali quebraria o build da JPI Tech. **Decisão: repositório próprio** em `Downloads/viratrend` (ADR-01). |
| Node / npm / pnpm                    | Node 24.13, npm 11.6, pnpm 12.5                                                                                                                                                                         |
| MySQL local                          | Laragon com MySQL 8.0.30 (usado para validar a migration). Docker não instalado.                                                                                                                        |
| Ferramentas de design                | ArtCraft (6 apps), GIMP 3 — não necessários nesta fase                                                                                                                                                  |
| Hostinger (MCP)                      | Conectado. A listagem de sites **não respondeu em 30 min**; ver §7                                                                                                                                      |
| Figma (MCP)                          | Requer autenticação — não usado                                                                                                                                                                         |

---

## 2. Arquitetura

```
 Navegador (mobile-first, tráfego de TikTok/Instagram)
     │
     ▼
 apps/web — Next.js 16 (Vercel)
   • Server Components buscam a API no servidor (ISR/revalidate) → HTML pronto para SEO
   • /admin: telas do painel; chamadas com cookie de sessão (credentials: 'include')
     │  HTTPS, JSON
     ▼
 apps/api — Express 5 (Hostinger Node.js)
   routes → controllers → services (regra de negócio) → repositories (Prisma)
   • /health  • /public/*  • /admin/* (sessão + papel)  • /go/:linkId (registra clique → 302 loja)
     │  Prisma 7 + adapter mariadb (pool pequeno)
     ▼
 MySQL 8 (Hostinger, mesmo servidor → 127.0.0.1)
```

**Responsabilidades**

- **web** só apresenta. Não conhece o banco nem segredos. Valida formulários com os mesmos schemas Zod de `packages/shared`, mas quem decide é a API.
- **api** é dona das regras: autenticação, autorização, validação, preço/oferta, cliques.
- **shared** contém só o que os dois usam: tipos de resposta, schemas de entrada, `slugify`, `formatBRL`.

**Portabilidade para VPS:** a API é um processo Node comum (`node dist/server.js`), configurado só por variáveis de ambiente, e o banco é MySQL padrão com migrations versionadas. Migrar = subir o mesmo build atrás de um Nginx e apontar `DATABASE_URL`. Nada depende de recurso proprietário da Hostinger.

---

## 3. Decisões (ADR resumido)

| #   | Decisão                                                                                                       | Por quê                                                                                                                                                   | Revisitar quando                                                     |
| --- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 01  | Repositório próprio, monorepo com **npm workspaces**                                                          | Isolado da JPI Tech; npm já vem com o Node e é o que Vercel/Hostinger rodam por padrão. Sem Turborepo/Nx.                                                 | Builds ficarem lentos (cache remoto)                                 |
| 02  | **Admin dentro do `apps/web`** (`/admin`)                                                                     | Reaproveita design system e deploy; um app a menos para manter. A proteção real está na API.                                                              | Admin precisar de domínio/infra separada                             |
| 03  | **Sessão opaca no MySQL** (tabela `sessions`, token aleatório no cookie, só o SHA-256 no banco) em vez de JWT | Logout e revogação imediatos; vazamento do banco não entrega sessões. Custo: 1 consulta por requisição admin (volume baixo).                              | Muitos admins / alto tráfego admin                                   |
| 04  | **Papel como enum** (`ADMIN`, `EDITOR`) em `users.role`, sem tabela `roles`                                   | Só existem dois papéis fixos e nenhuma permissão configurável. Tabela vazia de regras seria complexidade sem uso.                                         | Surgir permissão por recurso definida pelo usuário                   |
| 05  | **Preço em centavos (INT)**                                                                                   | Sem erro de ponto flutuante; JSON transporta inteiro.                                                                                                     | —                                                                    |
| 06  | **Preço anterior só de `price_history`**                                                                      | Cumpre "não inventar preço anterior": se não há registro real anterior, nada aparece. Histórico é só-inserção.                                            | —                                                                    |
| 07  | **Clique via `/go/:id` na API** (registra e redireciona 302)                                                  | Uma ida só; a URL de afiliado pode mudar sem republicar o site; dá para desativar link expirado na hora. Links públicos levam `rel="sponsored nofollow"`. | —                                                                    |
| 08  | **Clique sem IP nem ID de visitante**                                                                         | LGPD: dado mínimo. Guardamos link, produto, loja, host de origem e `utm_source`.                                                                          | Precisar de antifraude de cliques                                    |
| 09  | **Busca com `LIKE`** em nome/palavras-chave/descrição/categoria                                               | Catálogo inicial pequeno; índice FULLTEXT do MySQL não casa bem com prefixos curtos em PT.                                                                | > ~5 mil produtos ou busca lenta → índice FULLTEXT via migration SQL |
| 10  | **Imagens por URL** (`product_images.url`) com crédito/origem                                                 | Hospedagem compartilhada pode não preservar arquivos entre deploys (§7). Upload direto fica para quando o storage estiver decidido.                       | Antes da Fase 5: escolher storage (ver §7, risco R3)                 |
| 11  | **Prisma 7 + `@prisma/adapter-mariadb`**                                                                      | Versão estável atual; o adapter é o driver oficial para MySQL no Prisma 7 e permite limitar o pool.                                                       | —                                                                    |
| 12  | **TypeScript 5.9 e ESLint 9** (não TS 7 / ESLint 10)                                                          | `typescript-eslint` e `eslint-config-next` ainda validados nessas versões.                                                                                | Ecossistema estabilizar                                              |

---

## 4. Estrutura de pastas

Pastas são criadas quando o primeiro arquivo delas existe (sem diretórios vazios).

```
viratrend/
├── apps/
│   ├── web/                      Next.js 16 (App Router)
│   │   ├── app/                  rotas: (site)/…, admin/…, sitemap.ts, robots.ts
│   │   ├── components/
│   │   │   ├── brand/            logo.tsx ✔
│   │   │   ├── layout/           site-header.tsx ✔, site-footer.tsx ✔
│   │   │   └── ui/               botões, badges, cards (Fase 4)
│   │   ├── features/             blocos por domínio: product/, category/, admin/ (Fase 4–5)
│   │   ├── lib/                  site.ts ✔, api.ts (cliente server-only, Fase 4)
│   │   └── styles/globals.css ✔ tokens da marca
│   └── api/
│       ├── prisma/               schema.prisma ✔, migrations/ ✔, seed.ts ✔
│       ├── prisma.config.ts ✔
│       └── src/
│           ├── config/           env.ts ✔ (validação Zod), db.ts ✔ (pool)
│           ├── middlewares/      error-handler.ts ✔, auth.ts ✔, rate-limits.ts ✔
│           ├── routes/           index.ts ✔ (mapa único de rotas), health.routes.ts ✔
│           ├── controllers/      public ✔, admin ✔, auth ✔ — HTTP ↔ serviço
│           ├── services/         auth ✔, catalog ✔, product ✔, click ✔ — regras de negócio
│           ├── repositories/     auth ✔, catalog ✔, product ✔, click ✔ — único lugar com Prisma
│           ├── utils/            http-error.ts ✔
│           ├── app.ts ✔          helmet, CORS fechado, rate limit, JSON 100 kb
│           └── server.ts ✔       listen + desligamento limpo (SIGTERM)
├── packages/shared/src/          index.ts ✔ (+ teste)
├── docs/                         ARCHITECTURE.md ✔, brand/ ✔
├── .env.example ✔  .gitignore ✔  .prettierrc.json ✔  README.md ✔
└── package.json ✔                workspaces + scripts
```

`validators/` do pedido original foi absorvido por `packages/shared` (o mesmo schema Zod valida no admin e na API) — evita duas fontes de regra.

---

## 5. Modelo de dados (MySQL 8)

Implementado em [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma); migration inicial aplicada e verificada no MySQL 8.0 local.

| Tabela            | Papel                                                                   | Chaves e índices                                                                                | Exclusão                       |
| ----------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| `users`           | Administradores/editores. Sem cadastro público.                         | PK `id`; UNIQUE `email`                                                                         | lógica (`is_active`)           |
| `sessions`        | Sessões do painel (ADR-03)                                              | PK = SHA-256 do token; FK `user_id` CASCADE; idx `expires_at` (limpeza)                         | física (logout/expiração)      |
| `categories`      | Administráveis, com imagem, descrição e ordem                           | UNIQUE `slug`; idx (`is_active`,`sort_order`)                                                   | lógica; produto usa `RESTRICT` |
| `stores`          | Amazon, Mercado Livre…                                                  | UNIQUE `slug`                                                                                   | lógica (`is_active`)           |
| `products`        | Curadoria: descrição, "Por que vale", palavras-chave, destaque, em alta | UNIQUE `slug`; FK categoria `RESTRICT`; idx por status+publicação, destaque, em alta, categoria | lógica (`status = ARCHIVED`)   |
| `product_images`  | Galeria; `sort_order = 0` é a principal; `credit` registra a origem     | FK produto `CASCADE`; idx (`product_id`,`sort_order`)                                           | física                         |
| `affiliate_links` | Produto × loja: URL, principal, ativo, preço atual, situação da oferta  | UNIQUE (`product_id`,`store_id`); FKs `RESTRICT`; idx `offer_status`                            | lógica (`is_active`)           |
| `price_history`   | Cada preço conferido, só inserção, com quem/como conferiu               | FK link `CASCADE`; idx (`affiliate_link_id`,`checked_at`)                                       | nunca                          |
| `clicks`          | Interesse por produto e loja (ADR-08)                                   | FKs `RESTRICT`; idx (`product_id`,`created_at`), (`store_id`,`created_at`), `created_at`        | nunca                          |

Regras que o banco não expressa e ficam no serviço, em transação (implementadas e cobertas pelo teste de integração):

- No máximo **um link principal** por produto (MySQL não tem índice único parcial).
- Ao salvar preço novo: atualiza `affiliate_links.price_cents` **e** insere em `price_history`.
- `offer_status = VERIFIED` exige preço registrado e grava `offer_checked_at`; a oferta só aparece como conferida por 7 dias (`OFFER_MAX_AGE_DAYS`), calculado na leitura — sem job.
- Desativar o link principal promove outro link ativo do mesmo produto.
- Produto `ACTIVE` exige categoria ativa, ao menos uma imagem e um link ativo.

---

## 6. Segurança

Pronto: `helmet`; CORS com lista fechada e `credentials`; rate limit global; corpo JSON ≤ 100 kb; `trust proxy` configurável; erros centralizados sem stack para o cliente; logs sem body/cookies; variáveis validadas no boot (só nomes aparecem em erro); `.env` fora do git; headers de segurança no Next; Prisma = consultas parametrizadas.

Fase 3 (pronto e testado):

- Senha com **Argon2id** (parâmetros padrão da lib: 64 MiB, t=3, p=4). E-mail inexistente também passa por um hash, para o tempo de resposta não revelar quem é administrador; a mensagem de erro é a mesma.
- Sessão opaca: token aleatório de 256 bits no cookie, SHA-256 no banco, validade `SESSION_TTL_HOURS`. Em produção o cookie é `__Host-vt_session` (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, sem `Domain`): vale só para o host da API e não pode ser plantado por subdomínio. O painel chama a API direto do navegador com `credentials: 'include'`.
- Defesa CSRF além do SameSite: `POST/PATCH/DELETE` em `/auth` e `/admin` exigem `Origin` dentro de `CORS_ORIGINS`.
- Autorização: `/admin/*` exige ADMIN ou EDITOR; excluir categoria e criar/editar lojas só ADMIN.
- Rate limit do login: 5 tentativas falhas por IP+e-mail e 30 por IP a cada 15 min.
- Erros do Prisma viram 404/409 sem SQL na resposta; IDs BIGINT saem como string no JSON.
- Sem cadastro público: o primeiro usuário nasce por `npm run admin:create -w @viratrend/api -- --email … --name …` (senha pedida no terminal ou em `ADMIN_PASSWORD`, nunca em argumento). O mesmo comando troca a senha e derruba as sessões abertas.
- URL de afiliado nunca vai para o JSON público: o site recebe só `/go/:id`.

Recuperação de senha: **não implementada** — depende de um envio de e-mail configurado e testado.

---

## 7. Hospedagem — o que foi verificado e o que falta

**Verificado pelo MCP da Hostinger (documentação das operações disponíveis):**

- Há hospedagem de aplicações **Node.js** com variáveis de ambiente por site, build no servidor, logs de execução e reinício do processo — disponível nos planos **Business e Cloud**.
- Deploy por **repositório GitHub** ou arquivo.
- MySQL roda **no mesmo servidor** do site: o app conecta em `127.0.0.1:3306`. O host `srvNNNN.hstgr.io` só serve para acesso externo e exige liberar conexão remota.
- Operações de escrita são assíncronas (deploy/build: consultar status depois).

**Não verificado** (a listagem de sites ficou 30 min sem resposta — nenhuma informação da conta foi lida):

| Item                                       | Por que importa                                | Como confirmar                                                            |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Plano contratado (Business/Cloud?)         | Node.js só existe nesses planos                | Painel → Hospedagem                                                       |
| Versões de Node disponíveis                | Prisma 7 exige Node ≥ 20.19                    | Painel → Node.js → versão                                                 |
| Processo persistente / reinício após crash | Express precisa ficar de pé                    | Testar `/health` após deploy e após restart                               |
| `max_user_connections` do MySQL            | Define `DATABASE_POOL_SIZE`                    | `SHOW VARIABLES LIKE 'max_user_connections'`                              |
| Rodar `prisma migrate deploy`              | Migrations versionadas                         | Incluir no comando de build; ou rodar de fora com conexão remota liberada |
| Persistência de arquivos entre deploys     | Upload de imagens                              | Testar: gravar arquivo, redeployar, conferir                              |
| Subdomínio `api.` com HTTPS                | Cookie de sessão no mesmo domínio-raiz do site | Painel → Domínios/SSL                                                     |

**Riscos**

| #   | Risco                                                                         | Impacto                                  | Mitigação                                                                                                              |
| --- | ----------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| R1  | Limite baixo de conexões MySQL                                                | Erros 500 sob pico                       | Pool 5, ISR no Next (a API recebe poucas leituras), `/health` monitorado                                               |
| R2  | Site (Vercel) e API (Hostinger) em domínios-raiz diferentes                   | Cookie de sessão bloqueado como terceiro | Usar `viratrend.com.br` + `api.viratrend.com.br`                                                                       |
| R3  | Arquivos apagados no redeploy                                                 | Imagens somem                            | Storage de objetos (ex.: Cloudflare R2/S3) ou pasta fora do diretório de deploy — decidir na Fase 3                    |
| R4  | Latência Vercel ↔ Hostinger                                                   | Páginas lentas                           | Páginas públicas estáticas com revalidação; admin é dinâmico mas de baixo volume                                       |
| R5  | Regras dos programas de afiliados (uso de imagem, divulgação, preço em cache) | Conta de afiliado suspensa               | Aviso de afiliado em todo produto, `price_checked_at` visível, imagens com crédito; revisar termos antes do lançamento |
| R6  | Prisma 7 e Next 16 recentes                                                   | APIs mudam rápido                        | Versões fixadas (sem `^`), docs lidas do `node_modules`                                                                |

Nada foi contratado, publicado ou alterado em DNS.

---

## 8. Plano de implementação

| Fase | Entregas                                                                                                                                                                                                                                                                                    | Pronto quando                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1 ✔  | Auditoria, arquitetura, modelo, riscos, plano (este documento)                                                                                                                                                                                                                              | —                                                                                                      |
| 2 ✔  | Monorepo, TS, Next + tokens/fontes/logo, Express + segurança base, Prisma + migration, env, lint/format, docs                                                                                                                                                                               | `typecheck`, `lint`, `format:check`, testes e `build` verdes; `/health` com DB ok                      |
| 3 ✔  | Auth (Argon2id, sessões, papéis, script do 1º admin), seed de **demonstração marcado** (`[DEMO]`), endpoints públicos (listagens, produto, busca, categorias, ofertas) e admin (CRUD produtos, categorias, lojas, links, preços), `/go/:id`, rate limits, testes de integração dos serviços | Coleção de requests passa; login bloqueia após N tentativas; nenhum endpoint admin responde sem sessão |
| 4 ✔  | Componentes da marca (botões, busca, badges, card de produto com Quina, Fita, Sinal, etiqueta de preço), home (Radar), Em alta, Categorias, Busca, Ofertas, produto, institucionais                                                                                                         | Lighthouse mobile ≥ 90; páginas idênticas ao brandbook §11–12                                          |
| 5 ✔  | Painel: login, dashboard (totais, cliques, mais acessados), CRUDs, links, histórico de preços                                                                                                                                                                                               | Fluxo completo de cadastrar → publicar → clicar → ver no dashboard                                     |
| 6 ✔  | SEO (metadata, OG via `next/og`, sitemap, robots, JSON-LD `Product` só com preço conferido), acessibilidade (WCAG 2.2 AA), revisão de segurança, documentação de deploy, checklist Hostinger §7                                                                                             | Checklist assinado; deploy só com autorização                                                          |

---

## 9. API — referência (Fase 3)

Base local `http://localhost:4000`. Erros sempre no formato `{ "error": { "code", "message", "details?" } }`.

**Públicas** (somente leitura, `Cache-Control` curto para o CDN)

| Método | Rota                     | O que faz                                                                                                                                                            |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                | Processo + MySQL                                                                                                                                                     |
| GET    | `/public/categories`     | Categorias ativas com contagem de produtos publicados                                                                                                                |
| GET    | `/public/products`       | Cards paginados: `section` (featured, trending, recent, offers, popular), `category`, `q` (nome, resumo, palavras-chave, descrição, categoria), `page`, `limit` ≤ 48 |
| GET    | `/public/products/:slug` | Detalhe: galeria, ofertas por loja (preço, preço anterior comprovado, data), relacionados                                                                            |
| GET    | `/public/sitemap`        | Slugs e datas para o `sitemap.xml` do Next                                                                                                                           |
| GET    | `/go/:id`                | Registra o clique (sem IP) e redireciona 302 para a loja. Link indisponível → volta ao produto/site                                                                  |

`popular` = mais clicados em 30 dias (dado real). `offers` = links com oferta conferida há no máximo 7 dias.

**Autenticação** (exige `Origin` confiável)

| Método | Rota           | O que faz                                |
| ------ | -------------- | ---------------------------------------- |
| POST   | `/auth/login`  | `{ email, password }` → cookie de sessão |
| POST   | `/auth/logout` | Apaga a sessão                           |
| GET    | `/auth/me`     | Usuário da sessão                        |

**Painel** — `/admin/*`, sessão obrigatória (ADMIN ou EDITOR); (ADMIN) = só administrador

| Recurso    | Rotas                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard  | `GET /admin/dashboard` — totais, cliques (total, 30 dias, por loja), top 10 produtos                                                                                                       |
| Categorias | `GET` e `POST /admin/categories` · `PATCH /admin/categories/:id` · `DELETE /admin/categories/:id` (ADMIN; 409 se tiver produtos)                                                           |
| Lojas      | `GET /admin/stores` · `POST` (ADMIN) · `PATCH /admin/stores/:id` (ADMIN)                                                                                                                   |
| Produtos   | `GET /admin/products?status&categoryId&q&page` · `POST` (nasce DRAFT) · `GET` e `PATCH /admin/products/:id` (publicar = `status: ACTIVE`, exige imagem e link ativo) · `DELETE` = arquivar |
| Imagens    | `POST /admin/products/:id/images` (URL https, alt, crédito) · `DELETE /admin/images/:id`                                                                                                   |
| Links      | `POST /admin/products/:id/links` (1º link vira principal; um por loja) · `PATCH /admin/links/:id` (`url`, `isPrimary: true`, `isActive`, `offerStatus`)                                    |
| Preços     | `POST /admin/links/:id/prices` (`priceCents`, `source`) grava histórico e preço atual · `GET /admin/links/:id/prices`                                                                      |

**Testes:** `npm test -w @viratrend/api` sobe a API contra um banco MySQL criado só para a execução (`viratrend_test_<timestamp>`, migrations via `migrate deploy`) e o remove no final. Cobre proteção do painel; login (erro igual para e-mail inexistente, origem, cookie); fluxo cadastrar → publicar → preço → oferta → clique → dashboard; link principal único; conflitos; arquivamento; logout; rate limit.

**Decisões da Fase 3**

- Schemas de entidade sem `.default()`: no Zod 4, `.partial()` preserva defaults e um `PATCH` parcial apagaria campos não enviados (bug pego pelo teste). Os padrões ficam no banco.
- Sem `COOKIE_DOMAIN`: o cookie `__Host-` dispensa domínio compartilhado.
- Sem `cookie-parser`: leitura do cookie em 8 linhas (`readCookie`).

---

## 10. Interface pública (Fase 4)

**Páginas:** `/` (Radar + seções), `/em-alta`, `/ofertas`, `/categorias`, `/categoria/[slug]`, `/busca`, `/produto/[slug]`, `/sobre`, `/como-funcionam-os-links`, `/contato`, `/privacidade`, `/termos`, 404 e tela de erro.

**Dados:** Server Components chamam a API em `lib/api.ts` (só no servidor; `API_URL` não chega ao navegador) com ISR de 60 s. Listagens degradam para vazio se a API cair — a seção some, a página não quebra. Produto inexistente → 404. `generateMetadata` e a página compartilham a mesma chamada (`react/cache`).

**Componentes da marca:** `ProductCard` (Quina na foto, salto colorido pelo estado: Electric padrão, Lime oferta conferida, Brasa queda comprovada), `RankList` (números gigantes), `CategoryTile`, `Fita`, `Selo`, `Price`/`OfferPrice`, `OfferList`, `Gallery` (scroll-snap, sem JS), `SearchForm` (GET puro), `AffiliateNotice`, `MobileTabBar` (único componente cliente), `Pagination`.

**Regras de honestidade aplicadas na UI:** seção sem dado real não aparece; preço anterior só quando a API o comprova; "oferta conferida" com data; "populares" = cliques reais; sem contagem regressiva, avaliações ou depoimentos; produto sem foto mostra bloco da categoria, nunca ilustração que pareça o produto; todo botão de loja tem `rel="sponsored nofollow noopener"` e o aviso de afiliado ao lado.

**Configuração por ambiente** (ver `.env.example`): `IMAGE_HOSTS` (hosts otimizados pelo `next/image`; outros aparecem sem otimização), `NEXT_PUBLIC_TIKTOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` — vazios, o site mostra "em breve" em vez de link inventado.

**Pendências de conteúdo:** validar as cores de Games (Midnight + Lime) e Fitness (Lime Soft + Midnight) já aplicadas em `lib/category-theme.ts`; revisar Privacidade e Termos com assessoria jurídica; fotos reais com direito de uso.

---

## 11. Painel administrativo (Fase 5)

**Rotas** (`apps/web/app/admin`, fora de buscadores via `robots: noindex`):

| Rota                   | O que faz                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/login`         | Login. Sem cadastro: usuários nascem por `npm run admin:create -w @viratrend/api`                                                                                                                                      |
| `/admin`               | Dashboard: totais, publicados, destaques, em alta, categorias, cliques (30 dias e total), mais clicados, cliques por loja                                                                                              |
| `/admin/produtos`      | Lista com busca e filtro de situação, paginada                                                                                                                                                                         |
| `/admin/produtos/novo` | Cria rascunho                                                                                                                                                                                                          |
| `/admin/produtos/[id]` | Publicar / voltar a rascunho / arquivar; fotos (URL https + alt + crédito); lojas e links (principal, trocar URL, desativar expirado); registrar preço (com fonte) e histórico; situação da oferta; conteúdo editorial |
| `/admin/categorias`    | Criar, editar, desativar; excluir só se vazia (ADMIN)                                                                                                                                                                  |
| `/admin/lojas`         | Criar e editar (ADMIN); editores só visualizam                                                                                                                                                                         |

**Como funciona:** telas cliente que chamam a API direto do navegador (`lib/admin-api.ts`, `credentials: 'include'`). A sessão fica no cookie HttpOnly — o JavaScript nunca o lê. `AdminShell` confere `/auth/me` antes de mostrar o painel e qualquer 401 leva ao login; a proteção real continua na API (sessão, papel e origem em todas as rotas `/admin`). Formulários validam no navegador com os mesmos schemas Zod da API, com mensagens em português (`z.locales.ptBR`, ativado em `packages/shared`).

**Preço digitado:** `parseBRLToCents` aceita `89,90`, `1.299,90`, `R$ 59`; recusa `12.5` (ambíguo) e valores com mais de 2 casas.

**Verificado no navegador** (produção local, dados `[DEMO]`): guarda redireciona sem sessão; login; dashboard com números reais; criar produto com erros de campo em português; publicação recusada sem foto/link; oferta recusada sem preço; preço inválido recusado; dois preços → preço anterior aparece no site; publicar; criar e excluir categoria; lojas; painel em 375 px sem rolagem lateral; logout invalida a sessão na API.

**Limitação conhecida:** fotos entram por URL — upload direto depende da decisão de storage (risco R3, §7).

---

## 12. Finalização (Fase 6)

**SEO**

- `sitemap.xml` (páginas fixas + categorias + produtos publicados, via `/public/sitemap`), `robots.txt` (bloqueia `/admin` e `/busca`; previews da Vercel bloqueiam tudo), metadata e canonical por página, `/busca` com `noindex`.
- Imagem Open Graph padrão gerada com `next/og` a partir dos tokens; produto com foto usa a própria foto. O X/Twitter usa a `og:image`.
- JSON-LD na página de produto (`lib/structured-data.ts`): `Product` + `BreadcrumbList`. `Offer` **só** se o preço foi conferido há menos de 24 h; nunca `availability`, avaliações ou notas; link de afiliado não aparece; serialização escapa `<` (sem XSS). Coberto por teste (`npm test -w @viratrend/web`).

**Acessibilidade**

- Contraste: branco sobre Electric (#765BFF) dá 4,05:1 — abaixo do AA para texto pequeno. Botão secundário, badge "achadinho" e o bloco da categoria Tecnologia passaram para Electric Deep (#5B3FE8, 6,3:1). Electric segue nos saltos, números do ranking e títulos grandes (AA para texto grande ≥ 3:1).
- Auditoria automatizada em todas as páginas públicas (lang, um h1, ordem de títulos, alt, nome de links/botões, rótulos de campo, ids duplicados, title/description): o único problema — card `h3` direto sob o `h1` — foi corrigido com `headingLevel`.
- Já existentes: link "Pular para o conteúdo", foco visível global, `prefers-reduced-motion`, decoração com `aria-hidden`, botões de loja com `aria-label` completo.

**Segurança**

- Site: CSP estático (ver comentário em `next.config.ts` sobre nonce × cache), HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- API: além da Fase 3, `/go/:id` deixa de **contar** cliques acima de 20/min por IP (o visitante ainda é redirecionado) — robôs e F5 não inflam o dashboard. Testado.
- `npm audit --omit=dev`: 0 vulnerabilidades (06/11/2026).

**Build de produção verificado:** `npm run build:api` gera `apps/api/dist` (testes excluídos via `tsconfig.build.json`) e `node dist/server.js` respondeu `/health`, listagens e `/go`. `apps/web` compila sozinho a partir da própria pasta (`prebuild` compila `packages/shared`), como na Vercel.

**Testes:** `npm test` na raiz roda shared (4), web (3) e API (5 cenários de integração contra MySQL real).
