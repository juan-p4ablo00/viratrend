# ViraTrend

Plataforma de descoberta e curadoria de produtos virais (afiliados Amazon e Mercado Livre).
Não é marketplace: sem checkout, sem pagamento, sem dados de cartão.

| Pasta             | O que é                                               | Deploy planejado    |
| ----------------- | ----------------------------------------------------- | ------------------- |
| `apps/web`        | Site público + painel admin — Next.js 16, Tailwind v4 | Vercel              |
| `apps/api`        | API REST — Express 5, Prisma 7, MySQL                 | Hostinger (Node.js) |
| `packages/shared` | Tipos e schemas Zod usados pelos dois lados           | —                   |
| `docs/`           | Arquitetura, decisões e o brandbook (`docs/brand/`)   | —                   |

Arquitetura, modelo de dados, riscos e plano: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**. Deploy: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Rodar localmente

Requisitos: Node 20.19+ (testado no 24) e MySQL 8 (o Laragon desta máquina serve). O teste da API cria e remove o próprio banco; para outro servidor use `TEST_DATABASE_SERVER=mysql://usuario:senha@host:3306`.

```bash
npm install
cp .env.example apps/api/.env          # ajuste DATABASE_URL
npm run db:migrate                     # cria as tabelas
npm run db:seed                        # categorias e lojas (use -- --demo para produtos [DEMO])
npm run admin:create -w @viratrend/api -- --email voce@exemplo.com --name "Seu Nome"
npm run dev:api                        # http://localhost:4000/health
npm run dev:web                        # http://localhost:3000
```

## Verificações

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
```

## Regras do projeto

- A identidade visual em `docs/brand/ViraTrend-Identidade.html` é a referência. Tokens novos entram lá primeiro.
- Nada de preço anterior, desconto, avaliação ou escassez sem dado real registrado.
- Segredos só em variáveis de ambiente; `.env` nunca vai para o git.
- SQL só via Prisma (consultas parametrizadas). Consultas ficam em `repositories/`, nunca em rotas.
