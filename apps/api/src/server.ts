import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { createApp } from './app.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`ViraTrend API ouvindo na porta ${env.PORT} (${env.NODE_ENV})`);
});

// Encerramento limpo: o gerenciador de processos da hospedagem envia SIGTERM em deploy/restart.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
